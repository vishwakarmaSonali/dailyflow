"""Worker pool manager for async task processing."""

import asyncio
import logging
import time
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Any, Callable, Dict, Optional

logger = logging.getLogger(__name__)


class Worker(ABC):
    """Base class for async workers."""

    def __init__(self, worker_id: str, timeout_seconds: int = 30) -> None:
        """Initialize worker.

        Args:
            worker_id: Unique worker identifier
            timeout_seconds: Task timeout in seconds
        """
        self.worker_id = worker_id
        self.timeout_seconds = timeout_seconds
        self.is_running = False
        self.current_task: Optional[asyncio.Task[Any]] = None
        self.tasks_processed = 0
        self.tasks_failed = 0
        self.last_activity = datetime.now()

    async def start(self) -> None:
        """Start worker loop."""
        self.is_running = True
        logger.info(f"Worker {self.worker_id} started")

    async def stop(self) -> None:
        """Stop worker and cancel pending task."""
        self.is_running = False
        if self.current_task and not self.current_task.done():
            self.current_task.cancel()
            try:
                await self.current_task
            except asyncio.CancelledError:
                pass
        logger.info(
            f"Worker {self.worker_id} stopped. "
            f"Tasks: {self.tasks_processed}, Failed: {self.tasks_failed}"
        )

    async def process(self, task_data: Dict[str, Any]) -> None:
        """Process a task with timeout.

        Args:
            task_data: Task data to process
        """
        try:
            self.current_task = asyncio.create_task(
                self._execute_task(task_data)
            )
            await asyncio.wait_for(self.current_task, timeout=self.timeout_seconds)
            self.tasks_processed += 1
            self.last_activity = datetime.now()
            logger.debug(f"Worker {self.worker_id} completed task")
        except asyncio.TimeoutError:
            self.tasks_failed += 1
            logger.error(
                f"Worker {self.worker_id} task timeout after "
                f"{self.timeout_seconds}s"
            )
            await self._handle_timeout(task_data)
        except asyncio.CancelledError:
            logger.debug(f"Worker {self.worker_id} task cancelled")
        except Exception as e:
            self.tasks_failed += 1
            logger.error(f"Worker {self.worker_id} task failed: {str(e)}")
            await self._handle_error(task_data, e)
        finally:
            self.current_task = None

    @abstractmethod
    async def _execute_task(self, task_data: Dict[str, Any]) -> None:
        """Execute task. Must be implemented by subclasses.

        Args:
            task_data: Task data to process
        """
        pass

    async def _handle_timeout(self, task_data: Dict[str, Any]) -> None:
        """Handle task timeout. Can be overridden by subclasses.

        Args:
            task_data: Task data that timed out
        """
        pass

    async def _handle_error(
        self, task_data: Dict[str, Any], error: Exception
    ) -> None:
        """Handle task error. Can be overridden by subclasses.

        Args:
            task_data: Task data that failed
            error: Exception that was raised
        """
        pass

    def is_healthy(self) -> bool:
        """Check if worker is healthy.

        Returns:
            True if worker is running and responsive
        """
        if not self.is_running:
            return False

        timeout_threshold = datetime.now() - timedelta(minutes=5)
        if self.last_activity < timeout_threshold:
            return False

        if self.current_task and not self.current_task.done():
            elapsed = (datetime.now() - self.last_activity).total_seconds()
            if elapsed > self.timeout_seconds * 2:
                return False

        return True


class WorkerPool:
    """Manages a pool of async workers."""

    def __init__(
        self,
        worker_factory: Callable[[str], Worker],
        num_workers: int = 5,
        health_check_interval: int = 30,
    ) -> None:
        """Initialize worker pool.

        Args:
            worker_factory: Factory function to create workers
            num_workers: Number of workers to maintain
            health_check_interval: Interval between health checks in seconds
        """
        self.worker_factory = worker_factory
        self.num_workers = num_workers
        self.health_check_interval = health_check_interval
        self.workers: Dict[str, Worker] = {}
        self.task_queue: asyncio.Queue[Dict[str, Any]] = asyncio.Queue()
        self.is_running = False
        self.health_check_task: Optional[asyncio.Task[Any]] = None
        self.dispatcher_task: Optional[asyncio.Task[Any]] = None
        self.created_at = datetime.now()

    async def start(self) -> None:
        """Start worker pool and all workers."""
        if self.is_running:
            logger.warning("Worker pool already running")
            return

        self.is_running = True
        logger.info(f"Starting worker pool with {self.num_workers} workers")

        try:
            for i in range(self.num_workers):
                worker_id = f"worker-{i}"
                worker = self.worker_factory(worker_id)
                await worker.start()
                self.workers[worker_id] = worker

            self.dispatcher_task = asyncio.create_task(self._dispatcher_loop())
            self.health_check_task = asyncio.create_task(
                self._health_check_loop()
            )
            logger.info("Worker pool started successfully")

        except Exception as e:
            logger.error(f"Failed to start worker pool: {str(e)}")
            await self.stop()
            raise

    async def stop(self) -> None:
        """Stop worker pool and all workers."""
        if not self.is_running:
            return

        self.is_running = False
        logger.info("Stopping worker pool")

        try:
            if self.dispatcher_task and not self.dispatcher_task.done():
                self.dispatcher_task.cancel()
                try:
                    await self.dispatcher_task
                except asyncio.CancelledError:
                    pass

            if self.health_check_task and not self.health_check_task.done():
                self.health_check_task.cancel()
                try:
                    await self.health_check_task
                except asyncio.CancelledError:
                    pass

            for worker in self.workers.values():
                await worker.stop()

            self.workers.clear()
            logger.info("Worker pool stopped")

        except Exception as e:
            logger.error(f"Error stopping worker pool: {str(e)}")

    async def enqueue_task(self, task_data: Dict[str, Any]) -> None:
        """Enqueue task for processing.

        Args:
            task_data: Task data to process
        """
        if not self.is_running:
            raise RuntimeError("Worker pool is not running")

        await self.task_queue.put(task_data)
        logger.debug(f"Task enqueued. Queue size: {self.task_queue.qsize()}")

    async def _dispatcher_loop(self) -> None:
        """Dispatch tasks to available workers."""
        logger.debug("Dispatcher loop started")

        try:
            while self.is_running:
                try:
                    task_data = await asyncio.wait_for(
                        self.task_queue.get(), timeout=1.0
                    )
                    available_worker = await self._get_available_worker()
                    if available_worker:
                        await available_worker.process(task_data)
                    else:
                        await self.task_queue.put(task_data)
                        await asyncio.sleep(0.1)

                except asyncio.TimeoutError:
                    pass

        except asyncio.CancelledError:
            logger.debug("Dispatcher loop cancelled")
        except Exception as e:
            logger.error(f"Error in dispatcher loop: {str(e)}")

    async def _get_available_worker(self) -> Optional[Worker]:
        """Get next available worker.

        Returns:
            Available worker or None if all busy
        """
        for worker in self.workers.values():
            if not worker.current_task or worker.current_task.done():
                return worker
        return None

    async def _health_check_loop(self) -> None:
        """Periodically check worker health."""
        logger.debug("Health check loop started")

        try:
            while self.is_running:
                await asyncio.sleep(self.health_check_interval)
                await self._check_health()

        except asyncio.CancelledError:
            logger.debug("Health check loop cancelled")
        except Exception as e:
            logger.error(f"Error in health check loop: {str(e)}")

    async def _check_health(self) -> None:
        """Check health of all workers."""
        unhealthy = []

        for worker_id, worker in self.workers.items():
            if not worker.is_healthy():
                logger.warning(f"Worker {worker_id} is unhealthy")
                unhealthy.append(worker_id)

        for worker_id in unhealthy:
            await self._replace_worker(worker_id)

        if unhealthy:
            logger.info(f"Health check: {len(unhealthy)} workers replaced")

    async def _replace_worker(self, worker_id: str) -> None:
        """Replace a worker.

        Args:
            worker_id: ID of worker to replace
        """
        try:
            old_worker = self.workers.pop(worker_id, None)
            if old_worker:
                await old_worker.stop()

            new_worker = self.worker_factory(worker_id)
            await new_worker.start()
            self.workers[worker_id] = new_worker
            logger.info(f"Replaced worker {worker_id}")

        except Exception as e:
            logger.error(f"Error replacing worker {worker_id}: {str(e)}")

    def get_stats(self) -> Dict[str, Any]:
        """Get pool statistics.

        Returns:
            Dictionary with pool stats
        """
        total_processed = sum(w.tasks_processed for w in self.workers.values())
        total_failed = sum(w.tasks_failed for w in self.workers.values())
        queue_size = self.task_queue.qsize()
        uptime = (datetime.now() - self.created_at).total_seconds()

        return {
            "status": "running" if self.is_running else "stopped",
            "num_workers": len(self.workers),
            "queue_size": queue_size,
            "total_tasks_processed": total_processed,
            "total_tasks_failed": total_failed,
            "uptime_seconds": uptime,
            "workers": {
                worker_id: {
                    "healthy": worker.is_healthy(),
                    "tasks_processed": worker.tasks_processed,
                    "tasks_failed": worker.tasks_failed,
                    "current_task_active": (
                        worker.current_task is not None
                        and not worker.current_task.done()
                    ),
                }
                for worker_id, worker in self.workers.items()
            },
        }
