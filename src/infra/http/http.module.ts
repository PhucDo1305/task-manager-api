import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { TerminusModule } from '@nestjs/terminus'

import { DatabaseModule } from '../database/database.module'
import { CreateUserUseCase } from '@/domain/user/application/use-cases/create-user-use-case'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { GetUserByIdUseCase } from '@/domain/user/application/use-cases/get-user-by-id-use-case'
import { UpdateUserUseCase } from '@/domain/user/application/use-cases/update-user-use-case'
import { DeleteUserUseCase } from '@/domain/user/application/use-cases/delete-user-use-case'
import { CreateTaskUseCase } from '@/domain/task/application/use-cases/create-task-use-case'
import { GetTaskByIdUseCase } from '@/domain/task/application/use-cases/get-task-by-id-use-case'
import { FetchTasksUseCase } from '@/domain/task/application/use-cases/fetch-tasks-use-case'
import { UpdateTaskUseCase } from '@/domain/task/application/use-cases/update-task-use-case'
import { DeleteTaskUseCase } from '@/domain/task/application/use-cases/delete-task-use-case'
import { CreateUserController } from './controllers/users/create-user.controller'
import { GetUserByIdController } from './controllers/users/get-user-by-id.controller'
import { DeleteUserController } from './controllers/users/delete-user.controller'
import { CreateTaskController } from './controllers/tasks/create-task.controller'
import { GetTaskByIdController } from './controllers/tasks/get-task-by-id.controller'
import { FetchTasksController } from './controllers/tasks/fetch-tasks.controller'
import { UpdateTaskController } from './controllers/tasks/update-task.controller'
import { DeleteTaskController } from './controllers/tasks/delete-task.controller'
import { UpdateUserController } from './controllers/users/update-user.controller'
import { UpdateTaskStatusController } from './controllers/tasks/update-task-status.controller'
import { UpdateTaskStatusUseCase } from '@/domain/task/application/use-cases/update-task-status-use-case'
import { AuthenticateUserController } from './controllers/users/authenticate-user.controller'
import { AuthenticateUserUseCase } from '@/domain/user/application/use-cases/authenticate-user-use-case'
import { HealthController } from './controllers/health/health.controller'

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    TerminusModule,
    DatabaseModule,
    CryptographyModule,
  ],
  controllers: [
    AuthenticateUserController,
    CreateUserController,
    GetUserByIdController,
    UpdateUserController,
    DeleteUserController,

    CreateTaskController,
    GetTaskByIdController,
    FetchTasksController,
    UpdateTaskController,
    UpdateTaskStatusController,
    DeleteTaskController,

    HealthController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    AuthenticateUserUseCase,
    CreateUserUseCase,
    GetUserByIdUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,

    CreateTaskUseCase,
    GetTaskByIdUseCase,
    FetchTasksUseCase,
    UpdateTaskUseCase,
    UpdateTaskStatusUseCase,
    DeleteTaskUseCase,
  ],
})
export class HttpModule {}
