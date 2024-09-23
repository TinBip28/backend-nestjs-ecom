import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser, IUSerGoogle } from '../users/users.interface';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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
   * @returns
   */
  async login(user: IUser) {
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
   * @returns
   */
  async googleLogin(req: IUSerGoogle) {
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
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id: user._id,
      email: user.email,
      name: user.name,
    };
    return {
      message: 'User information from google',
      access_token: this.jwtService.sign(payload),
    };
  }
}
