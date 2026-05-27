import { User } from '../src/domain/entities/User';

describe('User Entity', () => {
  it('should create a user with valid data', () => {
    const user = User.create('test@example.com', 'password123', 'John Doe');
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('John Doe');
    expect(user.verified).toBe(false);
  });

  it('should throw error with invalid email', () => {
    expect(() => {
      User.create('invalid-email', 'password123', 'John Doe');
    }).toThrow('Invalid email format');
  });

  it('should throw error with short password', () => {
    expect(() => {
      User.create('test@example.com', 'short', 'John Doe');
    }).toThrow('Password must be at least 8 characters');
  });

  it('should check if email is verified', () => {
    const user = new User('1', 'test@example.com', 'hashed', 'John', false, new Date());
    expect(user.isEmailVerified()).toBe(false);
  });

  it('should not allow login if email not verified', () => {
    const user = new User('1', 'test@example.com', 'hashed', 'John', false, new Date());
    expect(user.canLogin()).toBe(false);
  });
});
