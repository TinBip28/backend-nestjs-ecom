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
    const { totalPrice, taxPrice, shippingFee } = await this.calculatePrice(
      orderIds,
      taxPercentage,
      shippingFeePercentage,
    );
    const payment = await this.paymentModel.create({
      orderIds: orderIds,
      taxPrice: taxPrice,
      shippingFee: shippingFee,
      totalAmount: totalPrice,
      taxPercentage: taxPercentage,
      shippingFeePercentage: shippingFeePercentage,
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
    const totalItems = (await this.paymentModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / +limit);
    const result = await this.paymentModel
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
    const payment = await this.paymentModel.findOne({ _id: id });
    if (!payment) {
      console.error(`Payment with id ${id} not found`);
    }
    return payment;
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
    @UserReq() user: IUser,
  ) {
    const payment = await this.findOne(id);
    const { orderIds, taxPercentage, shippingFeePercentage } = updatePaymentDto;
    const ids = orderIds ? orderIds : payment.orderIds;
    const tax = !isNaN(taxPercentage) ? taxPercentage : payment.taxPercentage;
    const shipping = !isNaN(shippingFeePercentage)
      ? shippingFeePercentage
      : payment.shippingFeePercentage;
    const { totalPrice, taxPrice, shippingFee } = await this.calculatePrice(
      ids,
      tax,
      shipping,
    );
    const updatedPayment = await this.paymentModel.updateOne(
      {
        _id: id,
      },
      {
        ...updatePaymentDto,
        taxPrice: taxPrice,
        shippingFee: shippingFee,
        totalAmount: totalPrice,
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

  /**
   * Kiểm tra id có hợp lệ không
   * @param id
   */
  checkValidId(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException({
        message: 'Id không hợp lệ',
        status: 400,
      });
    }
    return null;
  }

  /**
   * Tại đây không sử dụng map bởi vì map không chờ các thao tác này hoàn thành dẫn tới việc không cập nhật value cho giá tiền
   *
   * function tính toán số tiền cần thanh toán
   *
   * @returns totalPrice: number - tổng giá tiền
   * @param orderIds
   * @param taxPercentage
   * @param shippingFeePercentage
   */
  async calculatePrice(
    orderIds: Order[],
    taxPercentage: number,
    shippingFeePercentage: number,
  ) {
    let totalPrice = 0;
    let taxPrice = 0;
    let shippingFee = 0;
    for (const orderId of orderIds) {
      const order = await this.orderModel.findOne({ _id: orderId });
      if (!order) {
        throw new BadRequestException(`Đơn hàng ${order} không tồn tại`);
      }
      await this.orderModel.updateOne({ _id: orderId }, { status: 'SHIPPING' });
      const { product } = order;
      const item = await this.productModel.findOne({ _id: product._id });
      taxPrice = (taxPercentage / 100) * item.price;
      shippingFee = taxPrice * (shippingFeePercentage / 100);
      totalPrice +=
        product.purchaseQuantity * item.price + taxPrice + shippingFee;
    }
    return {
      totalPrice,
      taxPrice,
      shippingFee,
    };
  }
}
