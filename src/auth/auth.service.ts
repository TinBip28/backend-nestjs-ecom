import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser, IUSerGoogle } from '../users/users.interface';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import ms from 'ms';
import { RolesService } from '../roles/roles.service';
import { USER_ROLE } from '../databases/sample';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private rolesService: RolesService,
  ) {}

  /**
   * Function to validate user by return value of passport
   * @param username
   * @param pass
   */
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      const isMatch = this.usersService.checkUserPassword(pass, user.password);
      if (isMatch) {
        const userRole = user.role as unknown as { _id: string; name: string };
        const temp = await this.rolesService.findOne(userRole._id);
        return {
          ...user.toObject(),
          permissions: temp?.permissions ?? [],
        };
      }
    }
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
    const { _id, name, email, role, permissions, store } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
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
      role,
      permissions,
      store,
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
    let user = await this.usersService.findOneByUsername(email);
    if (!user) {
      user = await this.usersService.register(dataUser);
    }
    const role = await this.rolesService.findRoleByName(USER_ROLE);
    const payload: IUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: {
        _id: role._id.toString(),
        name: role.name,
      },
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
        const { _id, name, email, role } = user;
        const payload = {
          sub: 'token login',
          iss: 'from server',
          _id,
          name,
          email,
          role,
        };
        const newRefreshToken = this.createRefreshToken(payload);

        // Update new refresh token to user
        await this.usersService.updateUserToken(newRefreshToken, _id);

        //fetch user's role
        const userRole = user.role as unknown as { _id: string; name: string };
        const temp = await this.rolesService.findOne(userRole._id);

        // Set new refresh token to cookie
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
          role,
          permissions: temp?.permissions ?? [],
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
