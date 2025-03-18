import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { UserFactory } from '@test/factories/make-user'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { JwtService } from '@nestjs/jwt'
import { makeAccessToken } from '@test/factories/make-access-token'

describe('Create Task (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory

  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    userFactory = moduleRef.get(UserFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[POST] /tasks', async () => {
    const user = await userFactory.makePrismaUser()
    const accessToken = makeAccessToken({
      sub: user.id.toString(),
      service: jwt,
    })

    const response = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'New Task',
        description: 'Task description',
        dueDate: new Date().toISOString(),
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      task: {
        id: expect.any(String),
        title: 'New Task',
        description: 'Task description',
        dueDate: expect.any(String),
        status: 'PENDING',
        createdAt: expect.any(String),
        updatedAt: null,
        userId: user.id.toString(),
      },
    })
  })
})
