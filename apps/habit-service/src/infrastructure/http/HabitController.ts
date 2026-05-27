import { Router, Request, Response } from 'express';
import { CreateHabitUseCase } from '@application/use-cases/CreateHabitUseCase';
import { LogHabitUseCase } from '@application/use-cases/LogHabitUseCase';

export function createHabitController(
  habitRepository: any,
  eventPublisher: any
): Router {
  const router = Router();

  const createHabitUseCase = new CreateHabitUseCase(habitRepository);
  const logHabitUseCase = new LogHabitUseCase(habitRepository, eventPublisher);

  router.post('/', async (req: Request, res: Response) => {
    try {
      const { userId, name, description, frequency } = req.body;
      const habit = await createHabitUseCase.execute({
        userId,
        name,
        description,
        frequency,
      });

      res.status(201).json({
        success: true,
        data: habit,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  });

  router.post('/:habitId/log', async (req: Request, res: Response) => {
    try {
      const { habitId } = req.params;
      const { userId } = req.body;

      const event = await logHabitUseCase.execute({
        habitId,
        userId,
      });

      res.json({
        success: true,
        data: event,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  });

  router.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'up',
      service: 'habit-service',
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
