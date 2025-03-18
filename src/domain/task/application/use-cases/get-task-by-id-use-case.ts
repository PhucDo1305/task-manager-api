import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'

import { TasksRepository } from '../repositories/tasks-repository'

import { Task } from '../../enterprise/entities/task'
import { TaskNotFoundError } from './errors/task-not-found-error'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

interface GetTaskByIdUseCaseRequest {
  id: string
  currentUser: UserPayload
}

type GetTaskByIdUseCaseResponse = Either<
  TaskNotFoundError,
  {
    task: Task
  }
>

@Injectable()
export class GetTaskByIdUseCase {
  constructor(private tasksRepository: TasksRepository) {}

  async execute({
    id,
    currentUser,
  }: GetTaskByIdUseCaseRequest): Promise<GetTaskByIdUseCaseResponse> {
    const task = await this.tasksRepository.findById({
      id,
      userId: currentUser.sub,
    })

    if (!task) {
      return left(new TaskNotFoundError())
    }

    return right({
      task,
    })
  }
}
