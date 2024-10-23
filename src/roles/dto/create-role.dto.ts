import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'Name không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Description không được để trống' })
  description: string;

  @IsNotEmpty({ message: 'isActive không được để trống' })
  @IsBoolean({ message: 'isActive phải là boolean' })
  isActive: boolean;

  @IsNotEmpty({ message: 'Permissions không được để trống' })
  @IsMongoId({ each: true, message: 'Mỗi permission là một mongo object id' })
  @IsArray({ message: 'Permission là array !' })
  permissions: mongoose.Schema.Types.ObjectId[];
}
