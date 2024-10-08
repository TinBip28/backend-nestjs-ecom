import { IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty({ message: 'Sản phẩm mua không được để trống' })
  products: {
    _id: string;
    purchaseQuantity: number;
  };

  @IsNotEmpty({ message: 'Địa chỉ nhận hàng không được để trống' })
  status: 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'DELIVERED';
}
