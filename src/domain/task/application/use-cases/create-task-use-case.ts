import { Injectable } from '@nestjs/common'

import { Either, right } from '@/core/either'

import { Task } from '../../enterprise/entities/task'
import { TasksRepository } from '../repositories/tasks-repository'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

interface CreateTaskUseCaseRequest {
  title: string
  dueDate?: Date
  description: string
  currentUser: UserPayload
}

type CreateTaskUseCaseResponse = Either<
  null,
  {
    task: Task
  }
>

@Injectable()
export class CreateTaskUseCase {
  constructor(private tasksRepository: TasksRepository) {}

  async execute({
    title,
    dueDate,
    description,
    currentUser,
  }: CreateTaskUseCaseRequest): Promise<CreateTaskUseCaseResponse> {
    const task = Task.create({
      title,
      description,
      dueDate,
      userId: new UniqueEntityID(currentUser.sub),
    })

    await this.tasksRepository.save(task)

    return right({
      task,
    })
  }
}
