// HTTP Controller
// Express request/response handling

import { Router, Request, Response } from 'express';
import { RegisterUserUseCase } from '@application/use-cases/RegisterUserUseCase';
import { CreateUserDto } from '@application/dtos/CreateUserDto';
import bcrypt from 'bcryptjs';

export function createAuthController(userRepository: any): Router {
  const router = Router();

  const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
  };

  const registerUseCase = new RegisterUserUseCase(userRepository, hashPassword);

  router.post('/register', async (req: Request, res: Response) => {
    try {
      const dto = CreateUserDto.fromRequest(req.body);
      const result = await registerUseCase.execute({
        email: dto.email,
        password: dto.password,
        name: dto.name,
      });

      res.status(201).json({
        success: true,
        data: result,
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
      service: 'auth-service',
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
