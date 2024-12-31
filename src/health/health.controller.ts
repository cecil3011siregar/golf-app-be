import { Public } from '#/auth/decorators/public.decorators';
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    return this.health.check([
      () => {
        return this.http.pingCheck(
          'internet-connectivity',
          'https://www.google.com',
        );
      },
    ]);
  }
}
