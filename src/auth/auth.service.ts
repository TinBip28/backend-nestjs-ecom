import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser, IUSerGoogle } from '../users/users.interface';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import ms from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Function to validate user by return value of passport
   * @param username
   * @param pass
   */
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(username);
    if (user) {
      const isValid = this.usersService.checkUserPassword(pass, user.password);
      if (isValid) {
        return user;
      }
    }
    return null;
  }

  /**
   * Function to log in user and sync with jwt
   * @param user
   * @param response
   * @returns
   */
  async login(user: IUser, response: Response) {
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const { _id, name, email } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
    };
    const refresh_token = this.createRefreshToken(payload);
    await this.usersService.updateUserToken(refresh_token, _id);
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('REFRESH_TOKEN_EXPRIES_IN')),
    });
    return {
      access_token: this.jwtService.sign(payload),
      _id,
      name,
      email,
    };
  }

  /**
   * Function to log in user with Google
   * @param req
   * @param response
   * @returns
   */
  async googleLogin(req: IUSerGoogle, response: Response) {
    const { email, firstName, lastName } = req;
    const dataUser: CreateUserDto = {
      email: email,
      password: '123456',
      name: `${firstName} ${lastName}`,
      gender: 'unknown',
      age: undefined,
      address: '',
    };
    let user = await this.usersService.findOneByUserName(email);
    if (!user) {
      user = await this.usersService.create(dataUser);
    }
    const payload: IUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: 'user',
    };
    await this.login(payload, response);
    return {
      message: 'Đăng nhập bằng Google thành công',
    };
  }

  async register(user: CreateUserDto) {
    return await this.usersService.register(user);
  }

  createRefreshToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),

      expiresIn:
        ms(this.configService.get<string>('REFRESH_TOKEN_EXPRIES_IN')) / 1000,
    });
  }

  async refresh(refreshToken: string, response: Response) {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
      const user = await this.usersService.findByToken(refreshToken);
      if (user) {
        const { _id, name, email } = user;
        const payload = {
          sub: 'token login',
          iss: 'from server',
          _id,
          name,
          email,
        };
        const newRefreshToken = this.createRefreshToken(payload);
        await this.usersService.updateUserToken(newRefreshToken, _id);
        response.clearCookie('refresh_token');
        response.cookie('refresh_token', newRefreshToken, {
          httpOnly: true,
          maxAge: ms(
            this.configService.get<string>('REFRESH_TOKEN_EXPRIES_IN'),
          ),
        });
        return {
          access_token: this.jwtService.sign(payload),
          _id,
          name,
          email,
        };
      }
    } catch (error) {
      throw new BadRequestException({
        message: 'Token không hợp lệ hoặc hết hạn',
        error: error,
      });
    }
  }
}
