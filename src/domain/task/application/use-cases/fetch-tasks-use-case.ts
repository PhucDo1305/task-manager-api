import { Injectable } from '@nestjs/common'

import { Either, right } from '@/core/either'
import { calculatePaginationMetadata } from '@/core/utils/pagination-metadata'

import { TasksRepository } from '../repositories/tasks-repository'

import { Task, TaskStatus } from '../../enterprise/entities/task'
import { UserPayload } from '@/infra/auth/strategies/jwt.strategy'

interface FetchTasksUseCaseRequest {
  currentUser: UserPayload
  page: number
  limit: number
  status?: TaskStatus
  search?: string
}

interface FetchTasksUseCaseResponse {
  tasks: Task[]
  metadata: {
    page: number
    limit: number
    total: number
    nextPage: number | null
    previousPage: number | null
  }
}

@Injectable()
export class FetchTasksUseCase {
  constructor(private tasksRepository: TasksRepository) {}

  async execute({
    currentUser,
    page,
    limit,
    status,
    search,
  }: FetchTasksUseCaseRequest): Promise<
    Either<null, FetchTasksUseCaseResponse>
  > {
    const { tasks, total } = await this.tasksRepository.findAll({
      page,
      limit,
      userId: currentUser.sub,
      status,
      search,
    })

    const metadata = calculatePaginationMetadata({ page, limit, total })

    return right({
      tasks,
      metadata,
    })
  }
}
