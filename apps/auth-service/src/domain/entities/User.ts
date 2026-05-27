// Domain Entity - User.ts
// Rich domain object with business rules
// Zero external dependencies

export class User {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly password: string, // hashed
    readonly name: string,
    readonly verified: boolean,
    readonly createdAt: Date
  ) {}

  // Business logic methods
  isEmailVerified(): boolean {
    return this.verified;
  }

  canLogin(): boolean {
    return this.verified;
  }

  static create(email: string, password: string, name: string): User {
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    if (!name || name.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }

    return new User(
      Math.random().toString(36).substr(2, 9), // temp id
      email,
      password, // should be hashed by use case
      name,
      false,
      new Date()
    );
  }
}
