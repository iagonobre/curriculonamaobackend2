import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { User } from '@prisma/client';

import * as bcrypt from 'bcrypt';

import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateUserDTO, ListUsersDTO, EditUserDTO } from 'src/dtos/UserDTO';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async editUser({ name, email }: EditUserDTO, payload: string): Promise<User> {
    const userAuthor = await this.prisma.user.findUnique({
      where: {
        email: payload,
      },
    });

    if (!userAuthor) {
      throw new UnauthorizedException(
        'Somente um usuário válido pode editar outro!',
      );
    }

    if (name && email) {
      //VALIDAR EMAIL
      const updatedUser = await this.prisma.user.update({
        where: {
          id: userAuthor.id,
        },
        data: {
          name: name ? name : userAuthor.name,
          email: email ? email : userAuthor.email,
        },
      });
      return updatedUser;
    }
  }

  async findAllAndCount(): Promise<ListUsersDTO> {
    const total = await this.prisma.user.count();
    const users = await this.prisma.user.findMany();

    return {
      total,
      users,
    };
  }

  async findOne(username: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: username,
      },
    });

    return user;
  }

  async deleteUser(email: string, payload: string): Promise<User | undefined> {
    const userAuthor = await this.prisma.user.findUnique({
      where: {
        email: payload,
      },
    });

    if (!userAuthor) {
      throw new UnauthorizedException(
        'Somente um usuário válido pode deletar outro!',
      );
    }

    if (email === payload || userAuthor.admin) {
      const user = await this.prisma.user.delete({
        where: {
          email,
        },
      });

      return user;
    }

    throw new UnauthorizedException(
      'Você não tem permissão para deletar outra conta!',
    );
  }

  async registerRefreshToken(
    email: string,
    refreshToken: string,
  ): Promise<User> {
    const cryptedRefreshToken = await bcrypt.hash(refreshToken, 10);

    const user = await this.prisma.user.update({
      where: { email },
      data: {
        refreshToken: cryptedRefreshToken,
      },
    });

    return user;
  }

  async createUser({
    email,
    name,
    password,
  }: CreateUserDTO): Promise<User | undefined> {
    const cryptedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          name,
          password: cryptedPassword,
          createdAt: new Date(),
          admin: process.env.FIRST_ADMIN === email,
        },
      });

      return user;
    } catch {
      throw new BadRequestException('Não foi possível criar o usuário');
    }
  }
}
