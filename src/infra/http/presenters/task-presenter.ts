import { Task } from '@/domain/task/enterprise/entities/task'

export class TaskPresenter {
  static toHTTP(task: Task) {
    return {
      id: task.id.toString(),
      title: task.title,
      status: task.status,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      description: task.description,
      userId: task.userId.toString(),
    }
  }
}
