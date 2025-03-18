import { Injectable } from '@nestjs/common'

import { faker } from '@faker-js/faker'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'

import {
  Task,
  TaskProps,
  TaskStatus,
} from '@/domain/task/enterprise/entities/task'
import { PrismaTaskMapper } from '@/infra/database/mappers/prisma-task-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { makeUser } from './make-user'
import { PrismaUserMapper } from '@/infra/database/mappers/prisma-user-mapper'

export function makeTask(
  override: Partial<TaskProps> = {},
  id?: UniqueEntityID,
) {
  const user = makeUser()

  const task = Task.create(
    {
      userId: user.id,
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      dueDate: faker.date.future(),
      createdAt: new Date(),
      status: TaskStatus.PENDING,
      updatedAt: null,
      ...override,
    },
    id,
  )

  return task
}

@Injectable()
export class TaskFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaTask(data: Partial<TaskProps> = {}) {
    const user = makeUser()

    await this.prisma.user.create({
      data: PrismaUserMapper.toPrisma(user),
    })

    const task = makeTask(data)

    await this.prisma.task.create({
      data: PrismaTaskMapper.toPrisma(task),
    })

    return task
  }
}
