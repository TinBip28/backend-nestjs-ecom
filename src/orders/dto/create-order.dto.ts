import { IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty({ message: 'Cửa hàng không được để trống' })
  storeId: string;

  @IsNotEmpty({ message: 'Sản phẩm mua không được để trống' })
  product: {
    _id: string;
    purchaseQuantity: number;
  };

  status: 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
}
