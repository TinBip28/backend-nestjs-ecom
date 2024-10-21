import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Store, StoreDocument } from './schemas/store.schemas';
import { SoftDeleteModel } from 'mongoose-delete';
import { UserReq } from '../decorator/customize';
import { IUser } from '../users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class StoresService {
  constructor(
    @InjectModel(Store.name)
    private storeModel: SoftDeleteModel<StoreDocument>,
  ) {}

  public checkValidId(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException({
        message: 'Id không hợp lệ hoặc không tồn tại',
      });
    }
    return true;
  }

  async create(createStoreDto: CreateStoreDto, @UserReq() user: IUser) {
    let store = await this.storeModel.findOne({ name: createStoreDto.name });
    if (!store) {
      store = await this.storeModel.create({
        ...createStoreDto,
        createdBy: {
          _id: user._id,
          email: user.email,
        },
      });
    }
    return {
      message: 'Tạo cửa hàng thành công',
      _id: store._id,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.storeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / +limit);
    const result = await this.storeModel
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
    const store = await this.storeModel.findById({ _id: id });
    if (!store) {
      throw new BadRequestException({
        message: 'Không tìm thấy cửa hàng',
      });
    }
    return {
      message: 'Lấy thông tin cửa hàng thành công',
      store,
    };
  }

  async update(
    id: string,
    updateStoreDto: UpdateStoreDto,
    @UserReq() user: IUser,
  ) {
    this.checkValidId(id);
    const store = await this.storeModel.updateOne(
      { _id: id },
      {
        ...updateStoreDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return {
      message: 'Cập nhật cửa hàng thành công',
      store,
    };
  }

  async remove(id: string, @UserReq() user: IUser) {
    this.checkValidId(id);
    await this.storeModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.storeModel.delete({ _id: id });
  }
}
