import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'

import { Task, TaskStatus } from '../../enterprise/entities/task'
import { TasksRepository } from '../repositories/tasks-repository'

import { TaskNotFoundError } from './errors/task-not-found-error'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

interface UpdateTaskStatusUseCaseRequest {
  id: string
  status: TaskStatus
  currentUser: UserPayload
}

type UpdateTaskStatusUseCaseResponse = Either<
  TaskNotFoundError,
  {
    task: Task
  }
>

@Injectable()
export class UpdateTaskStatusUseCase {
  constructor(private tasksRepository: TasksRepository) {}

  async execute({
    id,
    status,
    currentUser,
  }: UpdateTaskStatusUseCaseRequest): Promise<UpdateTaskStatusUseCaseResponse> {
    const task = await this.tasksRepository.findById({
      id,
      userId: currentUser.sub,
    })

    if (!task) {
      return left(new TaskNotFoundError())
    }

    task.status = status
    task.updatedAt = new Date()

    await this.tasksRepository.update(task)

    return right({
      task,
    })
  }
}
