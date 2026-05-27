// DTO - Data Transfer Object
// Defines what data clients send/receive

export class CreateUserDto {
  constructor(
    readonly email: string,
    readonly password: string,
    readonly name: string
  ) {}

  static fromRequest(body: any): CreateUserDto {
    const { email, password, name } = body;
    if (!email || !password || !name) {
      throw new Error('Missing required fields');
    }
    return new CreateUserDto(email, password, name);
  }
}
