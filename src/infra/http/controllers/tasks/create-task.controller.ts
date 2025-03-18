import {
  Body,
  Post,
  Controller,
  HttpException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'

import { z } from 'zod'

import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { CreateTaskUseCase } from '@/domain/task/application/use-cases/create-task-use-case'
import { TaskPresenter } from '../../presenters/task-presenter'

const createTaskBodySchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must have at least 3 characters' })
    .max(255, { message: 'Title must have at most 255 characters' }),
  description: z.string().optional(),
  dueDate: z.coerce.date().nullish(),
})

const bodyValidationPipe = new ZodValidationPipe(createTaskBodySchema)

type CreateTaskBodySchema = z.infer<typeof createTaskBodySchema>

@Controller('tasks')
export class CreateTaskController {
  constructor(private createTaskUseCase: CreateTaskUseCase) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(
    @Body(bodyValidationPipe) body: CreateTaskBodySchema,
    @CurrentUser() currentUser: UserPayload,
  ) {
    const { title, description, dueDate } = body

    const result = await this.createTaskUseCase.execute({
      title,
      dueDate,
      description,
      currentUser,
    })

    if (result.isLeft()) {
      throw new HttpException('Internal server error', 500)
    }

    const { task } = result.value

    return {
      task: TaskPresenter.toHTTP(task),
    }
  }
}
