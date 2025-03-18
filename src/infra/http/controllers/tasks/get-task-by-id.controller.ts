import {
  Param,
  Get,
  Controller,
  HttpException,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'

import { GetTaskByIdUseCase } from '@/domain/task/application/use-cases/get-task-by-id-use-case'
import { TaskNotFoundError } from '@/domain/task/application/use-cases/errors/task-not-found-error'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { TaskPresenter } from '../../presenters/task-presenter'

@Controller('tasks')
export class GetTaskByIdController {
  constructor(private getTaskByIdUseCase: GetTaskByIdUseCase) {}

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async handle(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserPayload,
  ) {
    const result = await this.getTaskByIdUseCase.execute({
      id,
      currentUser,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case TaskNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new HttpException('Internal server error', 500)
      }
    }

    const { task } = result.value

    return {
      task: TaskPresenter.toHTTP(task),
    }
  }
}
