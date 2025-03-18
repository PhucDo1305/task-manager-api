import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'

import { User } from '../../enterprise/entities/user'
import { HashGenerator } from '../cryptography/hash-generator'
import { UsersRepository } from '../repositories/users-repository'

import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { UserNotFoundError } from './errors/user-not-found-error'

interface UpdateUserUseCaseRequest {
  id: string
  name: string
  email: string
  password: string
}

type UpdateUserUseCaseResponse = Either<
  UserNotFoundError | UserAlreadyExistsError,
  {
    user: User
  }
>

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    id,
    name,
    email,
    password,
  }: UpdateUserUseCaseRequest): Promise<UpdateUserUseCaseResponse> {
    const user = await this.usersRepository.findById(id)

    if (!user) {
      return left(new UserNotFoundError())
    }

    if (user.email !== email) {
      const userAlreadyExists = await this.usersRepository.findByEmail(email)

      if (userAlreadyExists) {
        return left(new UserAlreadyExistsError())
      }
    }

    if (password) {
      const hashedPassword = await this.hashGenerator.hash(password)
      user.password = hashedPassword
    }

    user.name = name
    user.email = email
    user.updatedAt = new Date()

    await this.usersRepository.update(user)

    return right({
      user,
    })
  }
}
