import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Public, ResponseMessage, UserReq } from '../decorator/customize';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GoogleAuthGuard } from './google-auth.guard';
import { IUser } from '../users/users.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ResponseMessage('Đăng nhập')
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @Public()
  handleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @ResponseMessage('Thông tin người dùng')
  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  getProfile(@Req() req: Request) {
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
  googleAuthRedirect(
    @Req() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.googleLogin(req.user, response);
  }

  @ResponseMessage('Đăng ký')
  @Public()
  @Post('/register')
  async register(@Req() req: Request) {
    return this.authService.register(req.body);
  }

  @Get('/account')
  @ResponseMessage('Thông tin người dùng')
  async getAccount(@UserReq() user: IUser) {
    return { user };
  }

  @Public()
  @Get('/refresh')
  @ResponseMessage('Làm mới token')
  refreshUser(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    return this.authService.refresh(refreshToken, response);
  }
}
