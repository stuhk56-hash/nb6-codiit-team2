import { Injectable } from '@nestjs/common';
// NOTE: PrismaService is a required dependency. It should handle Prisma client instantiation and connection.
// It is commonly located in a shared 'prisma' module.
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersRepository {
  constructor(
    // The PrismaService must be injected to interact with the database.
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Finds a user by their email address.
   * @param email The user's email.
   * @returns The user object or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Finds a user by their unique ID.
   * @param id The user's ID.
   * @returns The user object or null if not found.
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Creates a new user in the database.
   * @param createUserDto The DTO containing user creation data.
   * @param hashedPassword The user's hashed password.
   * @returns The newly created user object.
   */
  async create(
    createUserDto: CreateUserDto,
    hashedPassword: string,
  ): Promise<User> {
    const { name, email, type } = createUserDto;
    return this.prisma.user.create({
      data: {
        name,
        email,
        type,
        passwordHash: hashedPassword,
        imageUrl:
          'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/codiit/1749477485230-user_default.png',
      },
    });
  }

  /**
   * Updates a user's data.
   * @param userId The ID of the user to update.
   * @param data The data to update, conforming to Prisma.UserUpdateInput.
   * @returns The updated user object.
   */
  async update(userId: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  /**
   * Deletes a user from the database.
   * @param userId The ID of the user to delete.
   * @returns The deleted user object.
   */
  async delete(userId: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }
}
