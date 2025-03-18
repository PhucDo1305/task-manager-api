import {
  Body,
  Param,
  Put,
  Controller,
  HttpException,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'

import { z } from 'zod'

import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { UpdateTaskUseCase } from '@/domain/task/application/use-cases/update-task-use-case'
import { TaskNotFoundError } from '@/domain/task/application/use-cases/errors/task-not-found-error'
import { TaskStatus } from '@/domain/task/enterprise/entities/task'
import { TaskPresenter } from '../../presenters/task-presenter'

const updateTaskBodySchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must have at least 3 characters' })
    .max(255, { message: 'Title must have at most 255 characters' })
    .optional(),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
})

const bodyValidationPipe = new ZodValidationPipe(updateTaskBodySchema)

type UpdateTaskBodySchema = z.infer<typeof updateTaskBodySchema>

@Controller('tasks')
export class UpdateTaskController {
  constructor(private updateTaskUseCase: UpdateTaskUseCase) {}

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async handle(
    @Param('id') id: string,
    @Body(bodyValidationPipe) body: UpdateTaskBodySchema,
    @CurrentUser() currentUser: UserPayload,
  ) {
    const { title, description, dueDate, status } = body

    const result = await this.updateTaskUseCase.execute({
      id,
      title,
      status,
      dueDate,
      description,
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
