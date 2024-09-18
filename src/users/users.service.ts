import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schemas';
import { SoftDeleteModel } from 'mongoose-delete';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import mongoose from 'mongoose';
import { UserReq } from '../decorator/customize';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  hashPassword(password: string) {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }

  checkUserId(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException({
        message: 'Id không hợp lệ',
        status: 400,
      });
    }
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
      name: newUser.name,
      email: newUser.email,
    };
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    this.checkUserId(id);
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new BadRequestException({
        message: 'Không tìm thấy user',
        status: 404,
      });
    }
    return {
      message: 'Lấy thông tin user thành công',
      id: user._id,
      email: user.email,
    };
  }

  async update(updateUserDto: UpdateUserDto, @UserReq() user) {
    this.checkUserId(updateUserDto._id);
    const updateUser = await this.userModel.updateOne(
      { _id: updateUserDto._id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return {
      message: 'Cập nhật thông tin user thành công',
      updateUser,
    };
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
