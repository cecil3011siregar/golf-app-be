import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login')
  async create(@Body() loginDto: LoginDto) {
    return {
      data: await this.authService.login(loginDto),
      statusCode: HttpStatus.OK,
      message: 'success',
    }
  }
}
