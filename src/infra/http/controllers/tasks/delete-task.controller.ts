import {
  Param,
  Delete,
  Controller,
  HttpException,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'

import { DeleteTaskUseCase } from '@/domain/task/application/use-cases/delete-task-use-case'
import { TaskNotFoundError } from '@/domain/task/application/use-cases/errors/task-not-found-error'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

@Controller('tasks')
export class DeleteTaskController {
  constructor(private deleteTaskUseCase: DeleteTaskUseCase) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async handle(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserPayload,
  ) {
    const result = await this.deleteTaskUseCase.execute({
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
  }
}
