import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';
import { Order } from '../../orders/schemas/order.schemas';

export class CreatePaymentDto {
  @IsNotEmpty({ message: 'Vui lòng nhập đơn hàng' })
  @IsArray({ message: 'Đơn hàng phải là mảng' })
  orderIds: Order[];

  @IsNotEmpty({ message: 'Vui lòng nhập thuế' })
  @IsNumber({}, { message: 'Thuế phải là số' })
  taxPercentage: number;

  @IsNumber({}, { message: 'Phí vận chuyển phải là số' })
  shippingFeePercentage: number;
}
