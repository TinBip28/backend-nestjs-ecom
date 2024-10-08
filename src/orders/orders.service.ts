import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { IUser } from '../users/users.interface';
import { UserReq } from '../decorator/customize';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/order.schemas';
import { SoftDeleteModel } from 'mongoose-delete';
import { Product, ProductDocument } from '../products/schemas/product.schemas';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: SoftDeleteModel<OrderDocument>,
    @InjectModel(Product.name)
    private productModel: SoftDeleteModel<ProductDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto, @UserReq() user: IUser) {
    const { products } = createOrderDto;
    const product = await this.productModel.findById(products._id);
    if (!product) {
      throw new BadRequestException('Sản phẩm không tồn tại');
    }
    if (products.purchaseQuantity > product.quantity) {
      return {
        message: 'Số lượng sản phẩm không đủ',
      };
    }
    const order = await this.orderModel.create({
      ...createOrderDto,
      status: 'PROCESSING',
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      message: 'Tạo đơn hàng thành công',
      order,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.productModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / +limit);
    const result = await this.productModel
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
    const order = await this.orderModel.findById({ _id: id });
    if (!order) {
      throw new BadRequestException('Đơn hàng không tồn tại');
    }
    return {
      message: 'Lấy thông tin đơn hàng thành công',
      order,
    };
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    @UserReq() user: IUser,
  ) {
    this.checkValidId(id);
    const { status } = updateOrderDto;
    if (status === 'CANCELLED' + '') {
      return {
        message: 'Đơn hàng đã bị hủy',
      };
    }
    const updateOrder = await this.orderModel.updateOne(
      { _id: id },
      {
        ...updateOrderDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return {
      message: 'Cập nhật đơn hàng thành công',
      updateOrder,
    };
  }

  async remove(id: string, @UserReq() user: IUser) {
    this.checkValidId(id);
    await this.orderModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.orderModel.delete({
      _id: id,
    });
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