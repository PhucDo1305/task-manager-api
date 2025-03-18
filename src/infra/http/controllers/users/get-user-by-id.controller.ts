import {
  Get,
  Param,
  Controller,
  HttpException,
  NotFoundException,
} from '@nestjs/common'

import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error'
import { GetUserByIdUseCase } from '@/domain/user/application/use-cases/get-user-by-id-use-case'
import { UserPresenter } from '../../presenters/user-presenter'

@Controller('users')
export class GetUserByIdController {
  constructor(private getUserByIdUseCase: GetUserByIdUseCase) {}

  @Get(':id')
  async handle(@Param('id') id: string) {
    const result = await this.getUserByIdUseCase.execute({
      id,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message)
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
