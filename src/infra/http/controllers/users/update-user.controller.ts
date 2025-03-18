import {
  Body,
  Param,
  Put,
  Controller,
  HttpException,
  ConflictException,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'

import { z } from 'zod'

import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { UpdateUserUseCase } from '@/domain/user/application/use-cases/update-user-use-case'
import { UserAlreadyExistsError } from '@/domain/user/application/use-cases/errors/user-already-exists-error'
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error'
import { UserPresenter } from '../../presenters/user-presenter'

const updateUserBodySchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Name must have at least 3 characters' })
    .max(255, { message: 'Name must have at most 255 characters' })
    .optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
})

const bodyValidationPipe = new ZodValidationPipe(updateUserBodySchema)

type UpdateUserBodySchema = z.infer<typeof updateUserBodySchema>

@Controller('users')
export class UpdateUserController {
  constructor(private updateUserUseCase: UpdateUserUseCase) {}

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async handle(
    @Param('id') id: string,
    @Body(bodyValidationPipe) body: UpdateUserBodySchema,
  ) {
    const { name, email, password } = body

    const result = await this.updateUserUseCase.execute({
      id,
      name,
      email,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message)
        case UserAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new HttpException('Internal server error', 500)
      }
    }

    const { user } = result.value

    return {
      user: UserPresenter.toHTTP(user),
    }
  }
}
