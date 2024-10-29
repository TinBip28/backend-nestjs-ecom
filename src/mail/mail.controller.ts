import { Controller, Get } from '@nestjs/common';
/*import { MailService } from './mail.service';*/
import { Public, ResponseMessage } from '../decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from '../payment/schemas/payment.schemas';
import { SoftDeleteModel } from 'mongoose-delete';
import { Order, OrderDocument } from '../orders/schemas/order.schemas';
import { Product, ProductDocument } from '../products/schemas/product.schemas';

@Controller('mail')
export class MailController {
  constructor(
    /*
    private readonly mailService: MailService,*/
    private mailerService: MailerService,
    @InjectModel(Payment.name)
    private paymentModel: SoftDeleteModel<PaymentDocument>,
    @InjectModel(Order.name) private orderModel: SoftDeleteModel<OrderDocument>,
    @InjectModel(Product.name)
    private productModel: SoftDeleteModel<ProductDocument>,
  ) {}

  @Get()
  @Public()
  @ResponseMessage('Gửi mail')
  async handleSendMail() {
    const payments = await this.paymentModel.find({});
    for (const pay of payments) {
      const orderIds = pay.orderIds;
      const orderMatching = await this.orderModel.find({
        _id: { $in: orderIds },
      });
      if (orderMatching?.length) {
        const orders = orderMatching.map(async (order) => {
          const temp = await this.productModel.findOne({
            _id: order.product._id,
          });
          return {
            product: {
              name: temp.name,
              price: temp.price,
              image: temp.image,
            },
            quantity: order.product.purchaseQuantity,
          };
        });
        await this.mailerService.sendMail({
          to: 'lequangtin_t67@hus.edu.vn',
          from: '"Mailer" <noreply@gmail.com>',
          subject: 'Payment Success',
          template: 'payment-success',
          context: {
            receiver: pay._id,
            orders: orders,
          },
        });
      }
    }
  }
}
