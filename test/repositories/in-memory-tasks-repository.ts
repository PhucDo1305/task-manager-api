import { TasksRepository } from '@/domain/task/application/repositories/tasks-repository'
import { Task, TaskStatus } from '@/domain/task/enterprise/entities/task'

export class InMemoryTasksRepository implements TasksRepository {
  public items: Task[] = []

  async save(task: Task): Promise<Task> {
    this.items.push(task)
    return task
  }

  async findById({
    id,
    userId,
  }: {
    id: string
    userId: string
  }): Promise<Task | null> {
    return (
      this.items.find(
        (task) =>
          task.id.toString() === id && task.userId.toString() === userId,
      ) || null
    )
  }

  async findAll({
    page,
    limit,
    userId,
    status,
    search,
  }: {
    userId: string
    page: number
    limit: number
    status?: TaskStatus
    search?: string
  }) {
    let filteredTasks = this.items.filter(
      (task) => task.userId.toString() === userId,
    )

    if (status) {
      filteredTasks = filteredTasks.filter((task) => task.status === status)
    }

    if (search) {
      filteredTasks = filteredTasks.filter(
        (task) =>
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.description.toLowerCase().includes(search.toLowerCase()),
      )
    }

    const total = filteredTasks.length
    const tasks = filteredTasks.slice((page - 1) * limit, page * limit)

    return {
      tasks,
      total,
    }
  }

  async update(task: Task): Promise<Task> {
    const index = this.items.findIndex(
      (item) => item.id.toString() === task.id.toString(),
    )

    this.items[index] = task
    return task
  }

  async delete({ id, userId }: { id: string; userId: string }): Promise<void> {
    const index = this.items.findIndex(
      (task) => task.id.toString() === id && task.userId.toString() === userId,
    )

    this.items.splice(index, 1)
  }
}
