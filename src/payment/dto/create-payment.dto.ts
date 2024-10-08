import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty({ message: 'Vui lòng nhập cửa hàng' })
  storeId: {
    _id: string;
  };

  @IsNotEmpty({ message: 'Vui lòng nhập đơn hàng' })
  @IsArray({ message: 'Đơn hàng phải là mảng' })
  orderIds: string[];

  @IsNotEmpty({ message: 'Vui lòng nhập thuế' })
  @IsNumber({}, { message: 'Thuế phải là số' })
  taxPercentage: number;

  @IsNumber({}, { message: 'Phí vận chuyển phải là số' })
  shippingFeePercentage: number;
}
