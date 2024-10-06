import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schemas';
import { SoftDeleteModel } from 'mongoose-delete';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import mongoose from 'mongoose';
import { UserReq } from '../decorator/customize';
import { IUser } from './users.interface';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto, @UserReq() user?: IUser) {
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
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      message: 'Tạo tài khoản thành công',
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      createdBy: newUser.createdBy,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / +limit);
    const result = await this.userModel
      .find(filter)
      .limit(+limit)
      .skip(offset)
      .sort(sort as any)
      .select('-password')
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage,
        pageSize: defaultLimit,
        pages: totalPages,
        total: totalItems,
      },
      result: result,
    };
  }

  async findOne(id: string) {
    this.checkValidId(id);
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new BadRequestException({
        message: 'Không tìm thấy user',
        status: 404,
      });
    }
    return {
      message: 'Lấy thông tin user thành công',
      _id: user._id,
      name: user.name,
      email: user.email,
      address: user.address,
    };
  }

  async update(updateUserDto: UpdateUserDto, @UserReq() user: IUser) {
    this.checkValidId(updateUserDto._id);
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

  async remove(id: string, @UserReq() user: IUser) {
    this.checkValidId(id);
    if (user._id === id) {
      throw new BadRequestException({ message: 'Không thể xóa chính mình' });
    }
    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.userModel.delete({ _id: id });
  }

  async findOneByUserName(email: string) {
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new BadRequestException({
        message: 'Không tìm thấy user',
        status: 404,
      });
    }
    return {
      message: 'Tìm thấy user thành công !!!',
      _id: user._id,
      name: user.name,
      email: user.email,
      createdBy: user.createdBy,
    };
  }

  async register(user: RegisterDto) {
    const existedUser = await this.userModel.findOne({ email: user.email });
    if (existedUser) {
      throw new BadRequestException({
        message: 'Email đã tồn tại',
        status: 400,
      });
    }
    const hashPassword = this.hashPassword(user.password);
    const newUser = await this.userModel.create({
      ...user,
      password: hashPassword,
    });
    return {
      newUser,
    };
  }

  findOneByEmail(email: string) {
    return this.userModel.findOne({ email: email });
  }

  checkUserPassword(password: string, hashPassword: string) {
    return compareSync(password, hashPassword);
  }

  hashPassword(password: string) {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }

  checkValidId(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException({
        message: 'Id không hợp lệ',
        status: 400,
      });
    }
    return null;
  }
}
