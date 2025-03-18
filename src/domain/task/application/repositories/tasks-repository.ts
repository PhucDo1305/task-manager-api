import { Task, TaskStatus } from '@/domain/task/enterprise/entities/task'

export type TasksRepositoryFindByIdParams = {
  id: string
  userId: string
}

export type TasksRepositoryFindAllParams = {
  userId: string
  page: number
  limit: number
  status?: TaskStatus
  search?: string
}

export type TasksRepositoryDeleteParams = TasksRepositoryFindByIdParams

export abstract class TasksRepository {
  abstract save(data: Task): Promise<Task>
  abstract findById({
    id,
    userId,
  }: TasksRepositoryFindByIdParams): Promise<Task | null>

  abstract findAll({
    userId,
    page,
    limit,
    status,
    search,
  }: TasksRepositoryFindAllParams): Promise<{ tasks: Task[]; total: number }>

  abstract update(data: Task): Promise<Task>
  abstract delete({ id, userId }: TasksRepositoryDeleteParams): Promise<void>
}
