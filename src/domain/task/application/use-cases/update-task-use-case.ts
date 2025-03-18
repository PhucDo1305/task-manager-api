import { Injectable } from '@nestjs/common'

import { Either, left, right } from '@/core/either'

import { Task, TaskStatus } from '../../enterprise/entities/task'
import { TasksRepository } from '../repositories/tasks-repository'

import { TaskNotFoundError } from './errors/task-not-found-error'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

interface UpdateTaskUseCaseRequest {
  id: string
  title?: string
  dueDate?: Date
  status?: TaskStatus
  description?: string
  currentUser: UserPayload
}

type UpdateTaskUseCaseResponse = Either<
  TaskNotFoundError,
  {
    task: Task
  }
>

@Injectable()
export class UpdateTaskUseCase {
  constructor(private tasksRepository: TasksRepository) {}

  async execute({
    id,
    title,
    status,
    dueDate,
    description,
    currentUser,
  }: UpdateTaskUseCaseRequest): Promise<UpdateTaskUseCaseResponse> {
    const task = await this.tasksRepository.findById({
      id,
      userId: currentUser.sub,
    })

    if (!task) {
      return left(new TaskNotFoundError())
    }

    task.title = title ?? task.title
    task.status = status ?? task.status
    task.description = description ?? task.description
    task.dueDate = dueDate ?? task.dueDate
    task.updatedAt = new Date()

    await this.tasksRepository.update(task)

    return right({
      task,
    })
  }
}
