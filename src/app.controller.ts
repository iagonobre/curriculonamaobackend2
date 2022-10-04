import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Resume, User } from '@prisma/client';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/strategies/jwt-auth.guard';
import { LocalAuthGuard } from './auth/strategies/local-auth.guard';
import { Permissions } from './auth/strategies/permissions.decorator';
import { CvsService } from './cvs/cvs.service';
import {
  CreateCurriculumDTO,
  GenerateCurriculumDTO,
  ResponseGenerateCurriculumDTO,
} from './dtos/CurriculumDTO';

import {
  CreateUserDTO,
  DeleteUserDTO,
  EditUserDTO,
  ListUsersDTO,
  PayloadUserDTO,
} from './dtos/UserDTO';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly cvsService: CvsService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Request() req): any {
    return this.authService.login(req.user);
  }

  @Post('/user')
  async createUser(@Body() createUser: CreateUserDTO): Promise<User> {
    return this.usersService.createUser(createUser);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/user/edit')
  async editUser(
    @Body() editUser: EditUserDTO,
    @Request() req: PayloadUserDTO,
  ): Promise<User> {
    return this.usersService.editUser(editUser, req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/cv')
  async createCurriculum(
    @Body() createCurriculum: CreateCurriculumDTO,
    @Request() req: PayloadUserDTO,
  ): Promise<Resume> {
    return this.cvsService.createCurriculum(createCurriculum, req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/cv')
  async listCurriculum(@Request() req: PayloadUserDTO): Promise<Resume[]> {
    return this.cvsService.listCurriculum(req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/cv/download')
  async download(
    @Body() download: GenerateCurriculumDTO,
    @Request() req: PayloadUserDTO,
  ): Promise<ResponseGenerateCurriculumDTO> {
    return this.cvsService.generateFile(download, req.user.email);
  }

  @Permissions('ADMIN')
  @UseGuards(JwtAuthGuard)
  @Get('/user/list')
  async listUsers(): Promise<ListUsersDTO> {
    return this.usersService.findAllAndCount();
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/user/:email')
  async deleteUser(
    @Param() params: DeleteUserDTO,
    @Request() req: PayloadUserDTO,
  ): Promise<User | undefined> {
    return this.usersService.deleteUser(params.email, req.user.email);
  }
}
