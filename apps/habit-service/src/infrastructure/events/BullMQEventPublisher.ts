import { Queue } from 'bullmq';
import { IEventPublisher } from '@application/ports/IEventPublisher';
import { Redis } from 'ioredis';

export class BullMQEventPublisher implements IEventPublisher {
  private queues: Map<string, Queue> = new Map();

  constructor(private redis: Redis) {}

  async publish(eventName: string, payload: any): Promise<void> {
    let queue = this.queues.get(eventName);

    if (!queue) {
      queue = new Queue(eventName, { connection: this.redis });
      this.queues.set(eventName, queue);
    }

    await queue.add(eventName, payload, {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}
