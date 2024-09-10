import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schemas';
import { SoftDeleteModel } from 'mongoose-delete';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  hashPassword(password: string) {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }

  async create(createUserDto: CreateUserDto) {
    const userExisted = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (userExisted) {
      throw new BadRequestException({
        message: 'Email đã tồn tại',
        status: 400,
      });
    }
    const hashPassword = this.hashPassword(createUserDto.password);
    const newUser = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
    });
    return {
      message: 'Tạo tài khoản thành công',
      _id: newUser._id,
    };
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: string) {
    return this.userModel.findById(id);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  findOneByUserName(username: string) {
    return this.userModel.findOne({ email: username });
  }

  checkUserPassword(password: string, hassPassword: string) {
    return compareSync(password, hassPassword);
  }
}
