import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { UserReq } from '../decorator/customize';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schemas';
import { SoftDeleteModel } from 'mongoose-delete';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { IUser } from '../users/users.interface';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,
  ) {}

  async create(
    createPermissionDto: CreatePermissionDto,
    @UserReq() user: IUser,
  ) {
    const { name, apiPath, method, module } = createPermissionDto;
    const isExisted = await this.permissionModel.findOne({
      apiPath: apiPath,
      method: method,
    });
    if (isExisted) {
      return {
        message: 'Đường dẫn đã tồn tại',
      };
    }
    const permission = await this.permissionModel.create({
      name,
      apiPath,
      method,
      module,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      message: 'Tạo quyền thành công',
      _id: permission._id,
      createdAt: permission.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / +limit);
    const result = await this.permissionModel
      .find(filter)
      .limit(+limit)
      .skip(offset)
      .sort(sort as any)
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage,
        pageSize: defaultLimit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  findOne(id: string) {
    this.checkValidId(id);
    return this.permissionModel.findOne({ _id: id });
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
    @UserReq() user: IUser,
  ) {
    this.checkValidId(id);
    const updatePermission = await this.permissionModel.updateOne(
      { _id: id },
      {
        ...updatePermissionDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return {
      message: 'Cập nhật quyền thành công',
      updatePermission,
    };
  }

  async remove(id: string, @UserReq() user: IUser) {
    this.checkValidId(id);
    await this.permissionModel.updateOne(
      {
        _id: id,
      },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.permissionModel.delete({ _id: id });
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
