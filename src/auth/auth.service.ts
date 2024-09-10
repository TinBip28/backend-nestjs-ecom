import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  /**
   * Function to validate user by return value of passport
   * @param username
   * @param pass
   */
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUserName(username);
    if (user) {
      const isValid = this.usersService.checkUserPassword(pass, user.password);
      if (isValid) {
        return user;
      }
    }
    return null;
  }
}
