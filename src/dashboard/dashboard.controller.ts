import { Controller, Get, HttpStatus } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/')
  async getDashboard() {
    return {
      data: await this.dashboardService.getDashboard(),
      statusCode: HttpStatus.OK,
      message: 'success',
    };
  }
}
