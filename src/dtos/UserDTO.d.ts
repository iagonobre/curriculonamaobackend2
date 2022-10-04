import { User } from '@prisma/client';

export type UserDTO = {
  user: {
    id: number;
    email: string;
    name: string;
  };
  token: string;
  refreshToken: string;
};

export type CreateUserDTO = {
  email: string;
  name: string;
  password: string;
};

export type DeleteUserDTO = {
  email: string;
};

export type PayloadUserDTO = {
  user: {
    email: string;
  };
};

export type ListUsersDTO = {
  total: number;
  users: User[];
};

export type EditUserDTO = {
  name?: string;
  email?: string;
};
