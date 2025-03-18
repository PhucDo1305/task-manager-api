import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { UserFactory } from '@test/factories/make-user'
import { hash } from 'bcryptjs'
import request from 'supertest'

import { DEFAULT_SALT_ROUNDS } from '@/infra/auth/security'
import { DatabaseModule } from '@/infra/database/database.module'
import { AppModule } from '@/infra/app.module'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    userFactory = moduleRef.get(UserFactory)

    await app.init()
  })

  test('[POST] /auth/sessions', async () => {
    const userEmail = 'johndoe@example.com'
    const userPassword = '123456'

    const user = await userFactory.makePrismaUser({
      email: userEmail,
      password: await hash(userPassword, DEFAULT_SALT_ROUNDS),
    })

    const response = await request(app.getHttpServer())
      .post('/auth/sessions')
      .send({
        email: userEmail,
        password: userPassword,
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      user: {
        id: expect.any(String),
        name: user.name,
        email: userEmail,
        createdAt: expect.any(String),
        updatedAt: null,
      },
      accessToken: expect.any(String),
    })
  })
})
