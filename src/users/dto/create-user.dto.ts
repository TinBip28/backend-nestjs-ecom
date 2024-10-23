import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';

class Store {
  @IsNotEmpty({ message: 'Tên cửa hàng không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Id không được để trống' })
  _id: mongoose.Schema.Types.ObjectId;
}

export class CreateUserDto {
  @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
  name: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;

  @IsNotEmpty({ message: 'Tuổi không được để trống' })
  age: number | undefined;

  gender: string;

  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  address: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Store)
  @ValidateIf((object, value) => value !== null)
  store?: Store | null;
}

export class RegisterDto {
  @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;

  @IsNotEmpty({ message: 'Tuổi không được để trống' })
  age: number;
}
