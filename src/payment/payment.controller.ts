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
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ResponseMessage, UserReq } from '../decorator/customize';
import { IUser } from '../users/users.interface';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ResponseMessage('Tạo thanh toán thành công')
  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto, @UserReq() user: IUser) {
    return this.paymentService.create(createPaymentDto, user);
  }

  @ResponseMessage('Lấy danh sách thanh toán thành công')
  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.paymentService.findAll(+currentPage, +limit, qs);
  }

  @ResponseMessage('Lấy thông tin thanh toán theo id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @ResponseMessage('Cập nhật thông tin thanh toán')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @UserReq() user: IUser,
  ) {
    return this.paymentService.update(id, updatePaymentDto, user);
  }

  @ResponseMessage('Xóa thanh toán khỏi hệ thống')
  @Delete(':id')
  remove(@Param('id') id: string, @UserReq() user: IUser) {
    return this.paymentService.remove(id, user);
  }

  @Post('/by-user')
  @ResponseMessage('Lấy thông tin thanh toán theo user')
  getOrderByUser(@UserReq() user: IUser) {
    return this.paymentService.findByUser(user);
  }
}
