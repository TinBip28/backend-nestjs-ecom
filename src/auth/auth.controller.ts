import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Public, ResponseMessage } from '../decorator/customize';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ResponseMessage('Đăng nhập')
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @Public()
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }
}
