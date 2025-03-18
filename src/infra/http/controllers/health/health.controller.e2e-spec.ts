import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Health Check (E2E)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
    }).compile()

    app = moduleRef.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  test('[GET] /health', async () => {
    const response = await request(app.getHttpServer()).get('/health')

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      status: 'ok',
      info: {
        database: {
          status: 'up',
        },
      },
      error: {},
      details: {
        database: {
          status: 'up',
        },
      },
    })
  })
})
