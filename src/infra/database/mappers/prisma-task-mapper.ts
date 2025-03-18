import { Task as PrismaTask } from '@prisma/client'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import { Task, TaskStatus } from '@/domain/task/enterprise/entities/task'

export class PrismaTaskMapper {
  static toDomain(task: PrismaTask): Task {
    return Task.create(
      {
        title: task.title,
        status: task.status as TaskStatus,
        dueDate: task.dueDate,
        description: task.description,
        userId: new UniqueEntityID(task.userId),
        createdAt: task.createdAt,
        updatedAt: task.updatedAt ?? null,
      },
      new UniqueEntityID(task.id),
    )
  }

  static toPrisma(task: Task): PrismaTask {
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
