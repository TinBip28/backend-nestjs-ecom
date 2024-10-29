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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ResponseMessage, UserReq } from '../decorator/customize';
import { IUser } from '../users/users.interface';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ResponseMessage('Tạo đơn hàng mới')
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @UserReq() user: IUser) {
    return this.ordersService.create(createOrderDto, user);
  }

  @Post('/by-user')
  @ResponseMessage('Lấy thông tin đơn hàng theo user')
  getOrderByUser(@UserReq() user: IUser) {
    return this.ordersService.findByUser(user);
  }

  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.ordersService.findAll(+currentPage, +limit, qs);
  }

  @ResponseMessage('Lấy thông tin đơn hàng')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @ResponseMessage('Cập nhật đơn hàng')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @UserReq() user: IUser,
  ) {
    return this.ordersService.update(id, updateOrderDto, user);
  }

  @ResponseMessage('Xóa đơn hàng')
  @Delete(':id')
  remove(@Param('id') id: string, @UserReq() user: IUser) {
    return this.ordersService.remove(id, user);
  }
}
