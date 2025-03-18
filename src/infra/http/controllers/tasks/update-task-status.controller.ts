import {
  Body,
  Param,
  Controller,
  HttpException,
  NotFoundException,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common'

import { z } from 'zod'

import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { UpdateTaskStatusUseCase } from '@/domain/task/application/use-cases/update-task-status-use-case'
import { TaskNotFoundError } from '@/domain/task/application/use-cases/errors/task-not-found-error'
import { TaskStatus } from '@/domain/task/enterprise/entities/task'
import { TaskPresenter } from '../../presenters/task-presenter'

const updateTaskStatusBodySchema = z.object({
  status: z.nativeEnum(TaskStatus),
})

const bodyValidationPipe = new ZodValidationPipe(updateTaskStatusBodySchema)

type UpdateTaskStatusBodySchema = z.infer<typeof updateTaskStatusBodySchema>

@Controller('tasks')
export class UpdateTaskStatusController {
  constructor(private updateTaskStatusUseCase: UpdateTaskStatusUseCase) {}

  @HttpCode(HttpStatus.OK)
  @Patch(':id/status')
  async handle(
    @Param('id') id: string,
    @Body(bodyValidationPipe) body: UpdateTaskStatusBodySchema,
    @CurrentUser() currentUser: UserPayload,
  ) {
    const { status } = body

    const result = await this.updateTaskStatusUseCase.execute({
      id,
      status,
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
