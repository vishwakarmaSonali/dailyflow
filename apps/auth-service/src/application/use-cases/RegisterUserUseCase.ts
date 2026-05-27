// Use Case: RegisterUser
// Application layer - orchestrates domain and infrastructure

import { User } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { IUserRepository } from '@domain/repositories/IUserRepository';

export interface RegisterUserDto {
  email: string;
  password: string;
  name: string;
}

export interface RegisterUserResponse {
  id: string;
  email: string;
  name: string;
}

export class RegisterUserUseCase {
  constructor(private userRepository: IUserRepository, private hashPassword: (pwd: string) => Promise<string>) {}

  async execute(dto: RegisterUserDto): Promise<RegisterUserResponse> {
    // Validate email
    const email = new Email(dto.email);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email.value);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create user entity
    const user = User.create(email.value, dto.password, dto.name);

    // Hash password
    const hashedPassword = await this.hashPassword(dto.password);

    // Create user with hashed password
    const userWithHashedPassword = new User(
      user.id,
      user.email,
      hashedPassword,
      user.name,
      user.verified,
      user.createdAt
    );

    // Save to repository
    const savedUser = await this.userRepository.save(userWithHashedPassword);

    return {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
    };
  }
}
