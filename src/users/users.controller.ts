import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, UserReq } from '../decorator/customize';
import { IUser } from './users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ResponseMessage('Tạo người dùng mới')
  @Post()
  create(@Body() createUserDto: CreateUserDto, @UserReq() user: IUser) {
    return this.usersService.create(createUserDto, user);
  }

  @ResponseMessage('Lấy danh sách thông tin người dùng')
  @Public()
  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @ResponseMessage('Lấy thông tin người dùng theo id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ResponseMessage('Cập nhật thông tin người dùng')
  @Patch()
  update(@Body() updateUserDto: UpdateUserDto, @UserReq() user: IUser) {
    return this.usersService.update(updateUserDto, user);
  }

  @ResponseMessage('Xóa người dùng theo id')
  @Delete(':id')
  remove(@Param('id') id: string, @UserReq() user: IUser) {
    return this.usersService.remove(id, user);
  }
}
