import {
  Param,
  Delete,
  Controller,
  HttpException,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'

import { DeleteUserUseCase } from '@/domain/user/application/use-cases/delete-user-use-case'
import { UserNotFoundError } from '@/domain/user/application/use-cases/errors/user-not-found-error'

@Controller('users')
export class DeleteUserController {
  constructor(private deleteUserUseCase: DeleteUserUseCase) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async handle(@Param('id') id: string) {
    const result = await this.deleteUserUseCase.execute({
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
  }
}
