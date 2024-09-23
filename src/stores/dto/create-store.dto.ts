import { IsNotEmpty } from 'class-validator';

export class CreateStoreDto {
  @IsNotEmpty({ message: 'Tên cửa hàng không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Địa chỉ cửa hàng không được để trống' })
  address: string[];

  @IsNotEmpty({ message: 'Vui lòng nhập mô tả về cửa hàng' })
  description: string;

  @IsNotEmpty({ message: 'Vui lòng cập nhật logo cho của hàng' })
  logo: string;
}
