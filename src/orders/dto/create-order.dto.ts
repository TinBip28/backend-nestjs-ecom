import { IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateOrderDto {
  @IsNotEmpty({ message: 'Cửa hàng không được để trống' })
  storeId: string;

  @IsNotEmpty({ message: 'Sản phẩm mua không được để trống' })
  product: {
    _id: string;
    purchaseQuantity: number;
  };

  @IsNotEmpty({ message: 'UserId không được để trống' })
  @IsMongoId({ message: 'UserId không đúng định dạng' })
  userId: mongoose.Schema.Types.ObjectId;

  status: 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
}
