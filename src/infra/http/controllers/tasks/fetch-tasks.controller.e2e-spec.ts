import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { UserFactory } from '@test/factories/make-user'
import { TaskFactory } from '@test/factories/make-task'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { JwtService } from '@nestjs/jwt'
import { makeAccessToken } from '@test/factories/make-access-token'
import { TaskStatus } from '@/domain/task/enterprise/entities/task'

describe('Fetch Tasks (E2E)', () => {
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

  test('[GET] /tasks', async () => {
    const user = await userFactory.makePrismaUser()
    await taskFactory.makePrismaTask({ userId: user.id })
    await taskFactory.makePrismaTask({ userId: user.id })

    const accessToken = makeAccessToken({
      sub: user.id.toString(),
      service: jwt,
    })

    const response = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body.tasks).toHaveLength(2)
    expect(response.body.metadata).toEqual({
      page: 1,
      total: 2,
      limit: 10,
      nextPage: null,
      previousPage: null,
    })
  })

  test('[GET] /tasks with pagination', async () => {
    const user = await userFactory.makePrismaUser()
    for (let index = 0; index < 25; index++) {
      await taskFactory.makePrismaTask({ userId: user.id })
    }

    const accessToken = makeAccessToken({
      sub: user.id.toString(),
      service: jwt,
    })

    const response = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page: 2, limit: 10 })

    expect(response.statusCode).toBe(200)
    expect(response.body.tasks).toHaveLength(10)
    expect(response.body.metadata).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      nextPage: 3,
      previousPage: 1,
    })
  })

  test('[GET] /tasks with status filter', async () => {
    const user = await userFactory.makePrismaUser()
    for (let index = 0; index < 10; index++) {
      const status = index % 2 === 0 ? TaskStatus.PENDING : TaskStatus.DONE
      await taskFactory.makePrismaTask({ userId: user.id, status })
    }

    const accessToken = makeAccessToken({
      sub: user.id.toString(),
      service: jwt,
    })

    const response = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ status: TaskStatus.DONE })

    expect(response.statusCode).toBe(200)
    expect(response.body.tasks).toHaveLength(5)
    expect(
      response.body.tasks.every((task) => task.status === TaskStatus.DONE),
    ).toBe(true)
  })

  test('[GET] /tasks with search filter', async () => {
    const user = await userFactory.makePrismaUser()
    for (let index = 0; index < 10; index++) {
      await taskFactory.makePrismaTask({
        userId: user.id,
        title: `Task ${index}`,
        description: `Description ${index}`,
      })
    }

    const accessToken = makeAccessToken({
      sub: user.id.toString(),
      service: jwt,
    })

    const response = await request(app.getHttpServer())
      .get('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ search: 'Task 1' })

    expect(response.statusCode).toBe(200)
    expect(response.body.tasks).toHaveLength(1)
    expect(response.body.tasks[0].title).toContain('Task 1')
  })
})
