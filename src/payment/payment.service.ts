import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { UserReq } from '../decorator/customize';
import { IUser } from '../users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schemas';
import { SoftDeleteModel } from 'mongoose-delete';
import { Product, ProductDocument } from '../products/schemas/product.schemas';
import { Order, OrderDocument } from '../orders/schemas/order.schemas';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private paymentModel: SoftDeleteModel<PaymentDocument>,
    @InjectModel(Product.name)
    private productModel: SoftDeleteModel<ProductDocument>,
    @InjectModel(Order.name)
    private orderModel: SoftDeleteModel<OrderDocument>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, @UserReq() user: IUser) {
    const { orderIds, taxPercentage, shippingFeePercentage } = createPaymentDto;
    let totalPrice = 0;
    let taxPrice = 0;
    let shippingFee = 0;
    orderIds.map(async (orderId) => {
      const order = await this.orderModel.findOneAndUpdate(
        { _id: orderId },
        { status: 'SHIPPING' },
      );
      const { products } = order;
      const product = await this.productModel.findById(products._id);
      taxPrice = (taxPercentage / 100) * product.price;
      shippingFee = taxPrice * (shippingFeePercentage / 100);
      totalPrice += products.purchaseQuantity * product.price;
    });
    const payment = await this.paymentModel.create({
      orderIds: orderIds,
      taxPrice: taxPrice,
      shippingFee: shippingFee,
      totalAmount: totalPrice,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      message: 'Tạo thanh toán thành công',
      payment,
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

  findOne(id: string) {
    this.checkValidId(id);
    return this.paymentModel.findOne({ _id: id });
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
    @UserReq() user: IUser,
  ) {
    this.checkValidId(id);
    const updatedPayment = await this.paymentModel.updateOne(
      {
        _id: id,
      },
      {
        ...updatePaymentDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return {
      message: 'Cập nhật thanh toán thành công',
      updatedPayment,
    };
  }

  async remove(id: string, @UserReq() user: IUser) {
    this.checkValidId(id);
    await this.paymentModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.paymentModel.delete({ _id: id });
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
