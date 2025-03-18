import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Create User (E2E)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
    }).compile()

    app = moduleRef.createNestApplication()

    await app.init()
  })

  test('[POST] /users', async () => {
    const response = await request(app.getHttpServer()).post('/users').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      user: {
        id: expect.any(String),
        name: 'John Doe',
        email: 'johndoe@example.com',
        createdAt: expect.any(String),
        updatedAt: null,
      },
    })
  })
})
