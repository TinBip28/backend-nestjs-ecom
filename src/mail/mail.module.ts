import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from '../payment/schemas/payment.schemas';
import { Order, OrderSchema } from '../orders/schemas/order.schemas';
import { Product, ProductSchema } from '../products/schemas/product.schemas';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          secure: false,
          auth: {
            user: configService.get('SENDER_EMAIL'),
            pass: configService.get('PASSWORD_EMAIL'),
          },
        },

        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },

        preview: {
          open: true,
          dir: join(__dirname, 'templates'),
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [MailController],
  providers: [MailService],
})
export class MailModule {}
