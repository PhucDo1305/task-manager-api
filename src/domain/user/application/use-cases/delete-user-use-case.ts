import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'

import { UsersRepository } from '../repositories/users-repository'
import { UserNotFoundError } from './errors/user-not-found-error'

interface DeleteUserUseCaseRequest {
  id: string
}

type DeleteUserUseCaseResponse = Either<UserNotFoundError, null>

@Injectable()
export class DeleteUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    id,
  }: DeleteUserUseCaseRequest): Promise<DeleteUserUseCaseResponse> {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      return left(new UserNotFoundError())
    }

    await this.usersRepository.delete(id)

    return right(null)
  }
}
