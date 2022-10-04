import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { CvsModule } from './cvs/cvs.module';
import { ServeStaticModule } from '@nestjs/serve-static';

import { join } from 'path';

@Module({
  imports: [
    UsersModule,
    CvsModule,
    DatabaseModule,
    AuthModule,
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      serveRoot: '/cv',
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
