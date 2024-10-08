import { IsNotEmpty, IsNumber, Max } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Mô tả sản phẩm không được để trống' })
  description: string;

  @IsNotEmpty({ message: 'Vui lòng điền số lượng sản phẩm ' })
  @IsNumber({}, { message: 'Số lượng sản phẩm phải là số' })
  quantity: number;

  @IsNotEmpty({ message: 'Vui lòng nhập rating của sản phẩm' })
  @IsNumber({}, { message: 'Rating sản phẩm phải là số' })
  @Max(5, { message: 'Rating không được vượt quá 5' })
  rating: number;

  @IsNotEmpty({ message: 'Vui lòng nhập giá của sản phẩm' })
  price: number;
}
