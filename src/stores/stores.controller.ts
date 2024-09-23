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
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Public, ResponseMessage, UserReq } from '../decorator/customize';
import { IUser } from '../users/users.interface';

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @ResponseMessage('Tạo cửa hàng mới')
  @Post()
  create(@Body() createStoreDto: CreateStoreDto, @UserReq() user: IUser) {
    return this.storesService.create(createStoreDto, user);
  }

  @ResponseMessage('Lấy danh sách thông tin người dùng')
  @Public()
  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.storesService.findAll(+currentPage, +limit, qs);
  }

  @ResponseMessage('Lấy thông tin cửa hàng theo id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storesService.findOne(id);
  }

  @ResponseMessage('Cập nhật thông tin cửa hàng')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @UserReq() user: IUser,
  ) {
    return this.storesService.update(id, updateStoreDto, user);
  }

  @ResponseMessage('Xóa cửa hàng')
  @Delete(':id')
  remove(@Param('id') id: string, @UserReq() user: IUser) {
    return this.storesService.remove(id, user);
  }
}
