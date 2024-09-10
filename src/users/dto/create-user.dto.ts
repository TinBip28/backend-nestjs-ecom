import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
  name: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;

  @IsNotEmpty({ message: 'Tuổi không được để trống' })
  age: number;

  gender: string;

  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  address: string;
}
