/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common'

import {
  TasksRepository,
  TasksRepositoryDeleteParams,
  TasksRepositoryFindAllParams,
  TasksRepositoryFindByIdParams,
} from '@/domain/task/application/repositories/tasks-repository'
import { Task } from '@/domain/task/enterprise/entities/task'

import { PrismaService } from '../prisma.service'
import { PrismaTaskMapper } from '../../mappers/prisma-task-mapper'

@Injectable()
export class PrismaTasksRepository implements TasksRepository {
  constructor(private prisma: PrismaService) {}

  async save(data: Task) {
    const task = await this.prisma.task.create({
      data: PrismaTaskMapper.toPrisma(data),
    })

    return PrismaTaskMapper.toDomain(task)
  }

  async findById({ id, userId }: TasksRepositoryFindByIdParams) {
    const task = await this.prisma.task.findUnique({
      where: {
        id,
        userId,
      },
    })

    if (!task) {
      return null
    }

    return PrismaTaskMapper.toDomain(task)
  }

  async findAll({
    page,
    limit,
    userId,
    status,
    search,
  }: TasksRepositoryFindAllParams) {
    const where: Record<string, any> = { userId }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [tasks, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.task.count({
        where,
      }),
    ])

    return {
      tasks: tasks.map(PrismaTaskMapper.toDomain),
      total,
    }
  }

  async update(data: Task) {
    const task = await this.prisma.task.update({
      where: { id: data.id.toString() },
      data: PrismaTaskMapper.toPrisma(data),
    })

    return PrismaTaskMapper.toDomain(task)
  }

  async delete({ id, userId }: TasksRepositoryDeleteParams): Promise<void> {
    await this.prisma.task.delete({
      where: {
        id,
        userId,
      },
    })
  }
}
