import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UserReq } from '../decorator/customize';
import { IUser } from '../users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schemas';
import { SoftDeleteModel } from 'mongoose-delete';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: SoftDeleteModel<ProductDocument>,
  ) {}

  checkValidId(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException({
        message: 'Id không hợp lệ',
        status: 400,
      });
    }
    return null;
  }

  async create(createProductDto: CreateProductDto, @UserReq() user: IUser) {
    const newProduct = await this.productModel.create({
      ...createProductDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      message: 'Tạo sản phẩm thành công',
      _id: newProduct._id,
      name: newProduct.name,
      createdBy: newProduct.createdBy,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.productModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / +limit);
    const result = await this.productModel
      .find(filter)
      .limit(+limit)
      .skip(offset)
      .sort(sort as any)
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage,
        pageSize: defaultLimit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async findOne(id: string) {
    this.checkValidId(id);
    const product = await this.productModel.findById({
      _id: id,
    });
    if (!product) {
      throw new BadRequestException({
        message: 'Không tìm thấy sản phẩm',
      });
    }
    return {
      message: 'Lấy thông tin sản phẩm thành công',
      _id: product._id,
      name: product.name,
    };
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    @UserReq() user: IUser,
  ) {
    this.checkValidId(id);
    const updateProduct = await this.productModel.updateOne(
      { _id: id },
      {
        ...updateProductDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return {
      message: 'Cập nhật sản phẩm thành công',
      updateProduct,
    };
  }

  async remove(id: string, @UserReq() user: IUser) {
    this.checkValidId(id);
    await this.productModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.productModel.delete({ _id: id });
  }
}
