import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { UserFactory } from '@test/factories/make-user'
import { TaskFactory } from '@test/factories/make-task'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { JwtService } from '@nestjs/jwt'
import { makeAccessToken } from '@test/factories/make-access-token'

describe('Update Task (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
  let taskFactory: TaskFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, TaskFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    userFactory = moduleRef.get(UserFactory)
    taskFactory = moduleRef.get(TaskFactory)

    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[PUT] /tasks/:id', async () => {
    const user = await userFactory.makePrismaUser()
    const task = await taskFactory.makePrismaTask({ userId: user.id })

    const accessToken = makeAccessToken({
      sub: user.id.toString(),
      service: jwt,
    })

    const response = await request(app.getHttpServer())
      .put(`/tasks/${task.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Updated Task',
        description: 'Updated description',
        dueDate: new Date().toISOString(),
        status: 'DONE',
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      task: {
        id: task.id.toString(),
        title: 'Updated Task',
        description: 'Updated description',
        dueDate: expect.any(String),
        status: 'DONE',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        userId: user.id.toString(),
      },
    })
  })
})
