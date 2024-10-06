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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Public, ResponseMessage, UserReq } from '../decorator/customize';
import { IUser } from '../users/users.interface';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ResponseMessage('Tạo sản phẩm thành công')
  @Post()
  create(@Body() createProductDto: CreateProductDto, @UserReq() user: IUser) {
    return this.productsService.create(createProductDto, user);
  }

  @ResponseMessage('Lấy danh sách sản phẩm thành công')
  @Public()
  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.productsService.findAll(+currentPage, +limit, qs);
  }

  @ResponseMessage('Lấy thông tin sản phẩm theo id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @ResponseMessage('Cập nhật thông tin sản phẩm')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UserReq() user: IUser,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @ResponseMessage('Xóa sản phẩm khỏi hệ thống')
  @Delete(':id')
  remove(@Param('id') id: string, @UserReq() user: IUser) {
    return this.productsService.remove(id, user);
  }
}
