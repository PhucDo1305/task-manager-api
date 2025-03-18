import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { UserFactory } from '@test/factories/make-user'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { makeAccessToken } from '@test/factories/make-access-token'
import { JwtService } from '@nestjs/jwt'

describe('Update User (E2E)', () => {
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

  test('[PUT] /users/:id', async () => {
    const user = await userFactory.makePrismaUser()
    const accessToken = makeAccessToken({
      sub: user.id.toString(),
      service: jwt,
    })

    const response = await request(app.getHttpServer())
      .put(`/users/${user.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Updated Name',
        email: 'updatedemail@example.com',
        password: 'newpassword',
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      user: {
        id: user.id.toString(),
        name: 'Updated Name',
        email: 'updatedemail@example.com',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    })
  })
})
