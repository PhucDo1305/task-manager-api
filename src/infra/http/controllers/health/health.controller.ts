import { Public } from '@/infra/auth/decorators/public'
import { Controller, Get } from '@nestjs/common'
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus'
import { PrismaClient } from '@prisma/client'

@Public()
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database', new PrismaClient()),
    ])
  }
}
