import { Module } from '@nestjs/common'

import { PrismaService } from './prisma/prisma.service'
import { UsersRepository } from '@/domain/user/application/repositories/users-repository'
import { PrismaUsersRepository } from './prisma/repositories/prisma-users-repository'
import { TasksRepository } from '@/domain/task/application/repositories/tasks-repository'
import { PrismaTasksRepository } from './prisma/repositories/prisma-tasks-repository'

@Module({
  providers: [
    PrismaService,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
    {
      provide: TasksRepository,
      useClass: PrismaTasksRepository,
    },
  ],
  exports: [PrismaService, UsersRepository, TasksRepository],
})
export class DatabaseModule {}
