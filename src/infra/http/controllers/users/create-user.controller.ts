import {
  Body,
  Post,
  Controller,
  HttpException,
  HttpCode,
  HttpStatus,
  ConflictException,
} from '@nestjs/common'

import { z } from 'zod'

import { Public } from '@/infra/auth/decorators/public'

import { UserPresenter } from '../../presenters/user-presenter'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { CreateUserUseCase } from '@/domain/user/application/use-cases/create-user-use-case'
import { UserAlreadyExistsError } from '@/domain/user/application/use-cases/errors/user-already-exists-error'

const createUserBodySchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Name must have at least 3 characters' })
    .max(255, { message: 'Name must have at most 255 characters' }),
  email: z.string().email(),
  password: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(createUserBodySchema)

type CreateUserBodySchema = z.infer<typeof createUserBodySchema>

@Public()
@Controller('users')
export class CreateUserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async handle(@Body(bodyValidationPipe) body: CreateUserBodySchema) {
    const { name, email, password } = body

    const result = await this.createUserUseCase.execute({
      name,
      email,
      password,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
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
