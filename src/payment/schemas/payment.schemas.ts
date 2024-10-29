import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Order } from '../../orders/schemas/order.schemas';
import { Store } from '../../stores/schemas/store.schemas';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Store.name })
  storeId: {
    _id: mongoose.Schema.Types.ObjectId;
  };

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: Order.name })
  orderIds: Order[];

  @Prop()
  userId: mongoose.Schema.Types.ObjectId;

  @Prop()
  taxPercentage: number;

  @Prop()
  shippingFeePercentage: number;

  @Prop()
  totalAmount: number;

  @Prop()
  taxPrice: number;

  @Prop()
  shippingFee: number;

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
