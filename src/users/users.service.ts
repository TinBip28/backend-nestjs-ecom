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
import { StoresService } from '../stores/stores.service';
import { Role, RoleDocument } from '../roles/schemas/role.schemas';
import { USER_ROLE } from '../databases/sample';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    private storeService: StoresService,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
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
    if (createUserDto.store) {
      const id = createUserDto.store._id.toString();
      await this.storeService.findOne(id);
    }
    if (createUserDto.role!) {
      createUserDto.role = await this.roleModel.findOne({ name: USER_ROLE });
    }
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
    return this.userModel
      .findOne({ _id: id })
      .select('-password')
      .populate({
        path: 'role',
        select: { _id: 1, name: 1 },
      });
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'Not found';
    }
    if (user._id === id) {
      throw new BadRequestException('Không thể xóa chính mình');
    }
    const userDelete = await this.userModel.findOne({ _id: id });
    if (userDelete.email === 'admin@gmail.com') {
      throw new BadRequestException('Không thể xóa admin');
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

  async register(user: RegisterDto) {
    const { name, email, password, age, gender, address } = user;
    const isExist = await this.userModel.findOne({ email: email });
    if (isExist) {
      throw new BadRequestException(`Email : ${email} này đã được sử dụng`);
    }

    const userRole = await this.roleModel.findOne({ name: USER_ROLE });

    const hashedPassword = this.hashPassword(password);
    return await this.userModel.create({
      name,
      email,
      age,
      gender,
      address,
      role: userRole._id,
      password: hashedPassword,
    });
  }

  findOneByUsername(username: string) {
    return this.userModel
      .findOne({
        email: username,
      })
      .populate({
        path: 'role',
        select: { name: 1 },
      });
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
        message: 'Id không hợp lệ user',
        status: 400,
      });
    }
    return null;
  }

  async updateUserToken(
    refreshToken: string,
    _id: string | mongoose.Types.ObjectId,
  ) {
    return this.userModel.updateOne(
      { _id: _id },
      { refreshToken: refreshToken },
    );
  }

  async findByToken(refreshToken: string) {
    return this.userModel.findOne({ refreshToken: refreshToken }).populate({
      path: 'role',
      select: { name: 1 },
    });
  }
}
