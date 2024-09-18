import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage, UserReq } from '../decorator/customize';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ResponseMessage('Tạo người dùng mới')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ResponseMessage('Lấy danh sách thông tin người dùng')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ResponseMessage('Lấy thông tin người dùng theo id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ResponseMessage('Cập nhật thông tin người dùng')
  @Patch()
  update(@Body() updateUserDto: UpdateUserDto, @UserReq() user) {
    return this.usersService.update(updateUserDto, user);
  }

  @ResponseMessage('Xóa người dùng theo id')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
