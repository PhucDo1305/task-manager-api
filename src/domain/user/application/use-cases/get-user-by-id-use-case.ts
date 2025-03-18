import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'

import { UsersRepository } from '../repositories/users-repository'

import { UserNotFoundError } from './errors/user-not-found-error'
import { User } from '../../enterprise/entities/user'

interface GetUserByIdUseCaseRequest {
  id: string
}

type GetUserByIdUseCaseResponse = Either<
  UserNotFoundError,
  {
    user: User
  }
>

@Injectable()
export class GetUserByIdUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    id,
  }: GetUserByIdUseCaseRequest): Promise<GetUserByIdUseCaseResponse> {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      return left(new UserNotFoundError())
    }

    return right({
      user,
    })
  }
}
