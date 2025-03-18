import {
  Get,
  Query,
  Controller,
  HttpException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'

import { FetchTasksUseCase } from '@/domain/task/application/use-cases/fetch-tasks-use-case'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { TaskPresenter } from '../../presenters/task-presenter'
import { TaskStatus } from '@/domain/task/enterprise/entities/task'

@Controller('tasks')
export class FetchTasksController {
  constructor(private fetchTasksUseCase: FetchTasksUseCase) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async handle(
    @CurrentUser() currentUser: UserPayload,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: TaskStatus,
    @Query('search') search?: string,
  ) {
    const result = await this.fetchTasksUseCase.execute({
      currentUser,
      page: Number(page),
      limit: Number(limit),
      status,
      search,
    })

    if (result.isLeft()) {
      throw new HttpException('Internal server error', 500)
    }

    const { tasks, metadata } = result.value

    return {
      tasks: tasks.map(TaskPresenter.toHTTP),
      metadata,
    }
  }
}
