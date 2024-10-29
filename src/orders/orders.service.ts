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
    const { product, status } = createOrderDto;
    const item = await this.productModel.findById(product._id);
    if (!product) {
      throw new BadRequestException('Sản phẩm không tồn tại');
    }
    if (product.purchaseQuantity > item.quantity) {
      throw new Error('Số lượng sản phẩm không đủ');
    }
    const order = await this.orderModel.create({
      ...createOrderDto,
      status: status || 'PROCESSING',
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    await this.productModel.updateOne(
      { _id: product._id },
      { $inc: { quantity: -product.purchaseQuantity } },
    );

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
    const totalItems = (await this.orderModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / +limit);
    const result = await this.orderModel
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
    return order;
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    @UserReq() user: IUser,
  ) {
    await this.findOne(id);
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
    if (updateOrderDto.status === 'CANCELLED') {
      return {
        message: 'Hủy đơn hàng thành công',
        delete: await this.remove(id, user),
      };
    }
    return {
      message: 'Cập nhật đơn hàng thành công',
      updateOrder,
    };
  }

  async remove(id: string, @UserReq() user: IUser) {
    this.checkValidId(id);
    const order = await this.findOne(id);
    const { product } = order;
    await this.productModel.updateOne(
      { _id: product._id },
      { $inc: { quantity: product.purchaseQuantity } },
    );
    await this.orderModel.updateOne(
      { _id: id },
      {
        status: 'CANCELLED',
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
        message: 'Id không hợp lệ order',
        status: 400,
      });
    }
    return null;
  }

  findByUser(user: IUser) {
    return this.orderModel
      .find({ userId: user._id })
      .sort('-createdAt')
      .populate([
        { path: 'storeId', select: { name: 1 } },
        { path: 'product', select: { name: 1 } },
      ]);
  }
}
