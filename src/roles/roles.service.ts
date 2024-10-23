import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserReq } from '../decorator/customize';
import { IUser } from '../users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schemas/role.schemas';
import { SoftDeleteModel } from 'mongoose-delete';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { ADMIN_ROLE } from '../databases/sample';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  async create(createRoleDto: CreateRoleDto, @UserReq() user: IUser) {
    const { name, description, permissions, isActive } = createRoleDto;
    if (await this.roleModel.exists({ name })) {
      throw new BadRequestException('Role đã tồn tại');
    }
    const newRole = await this.roleModel.create({
      name,
      description,
      permissions,
      isActive,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      message: 'Tạo role thành công',
      _id: newRole?._id,
      createdAt: newRole?.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.roleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / +limit);
    const result = await this.roleModel
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

  async findOne(id: string) {
    this.checkValidId(id);
    return (await this.roleModel.findById(id)).populate({
      path: 'permissions',
      select: { _id: 1, apiPath: 1, method: 1, module: 1 },
    });
  }

  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
    @UserReq() user: IUser,
  ) {
    this.checkValidId(id);
    const { name, description, isActive, permissions } = updateRoleDto;
    const updatedRole = await this.roleModel.updateOne(
      { _id: id },
      {
        name,
        description,
        isActive,
        permissions,
        updatedBy: { _id: user._id, email: user.email },
      },
    );
    return {
      message: 'Cập nhật role thành công',
      updatedRole,
    };
  }

  async remove(id: string, user: IUser) {
    this.checkValidId(id);
    const deleteRole = await this.roleModel.findById({ _id: id });
    if (deleteRole.name === ADMIN_ROLE) {
      throw new BadRequestException('Cannot delete ADMIN ');
    }

    await this.roleModel.updateOne(
      { _id: id },
      { deteledBy: { _id: user._id, email: user.email } },
    );
    return this.roleModel.delete({ _id: id });
  }

  checkValidId(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }
    return null;
  }
}
