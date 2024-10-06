import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Public, ResponseMessage } from '../decorator/customize';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleAuthGuard } from './google-auth.guard';

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

  @ResponseMessage('Thông tin người dùng')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @ResponseMessage('Đăng nhập với Google')
  @Public()
  @Get('/login/google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    return { message: 'Login with google' };
  }

  @ResponseMessage('Đăng nhập với Google')
  @Public()
  @Get('/login/google/redirect')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@Request() req) {
    return this.authService.googleLogin(req.user);
  }

  @ResponseMessage('Đăng ký')
  @Public()
  @Post('/register')
  async register(@Request() req) {
    return this.authService.register(req.body);
  }
}
