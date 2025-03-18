import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'

import { TasksRepository } from '../repositories/tasks-repository'
import { TaskNotFoundError } from './errors/task-not-found-error'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

interface DeleteTaskUseCaseRequest {
  id: string
  currentUser: UserPayload
}

type DeleteTaskUseCaseResponse = Either<TaskNotFoundError, null>

@Injectable()
export class DeleteTaskUseCase {
  constructor(private tasksRepository: TasksRepository) {}

  async execute({
    id,
    currentUser,
  }: DeleteTaskUseCaseRequest): Promise<DeleteTaskUseCaseResponse> {
    const task = await this.tasksRepository.findById({
      id,
      userId: currentUser.sub,
    })

    if (!task) {
      return left(new TaskNotFoundError())
    }

    await this.tasksRepository.delete({
      id,
      userId: currentUser.sub,
    })

    return right(null)
  }
}
