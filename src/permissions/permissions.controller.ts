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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Public, ResponseMessage, UserReq } from '../decorator/customize';
import { IUser } from '../users/users.interface';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ResponseMessage('Tạo quyền thành công')
  @Post()
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @UserReq() user: IUser,
  ) {
    return this.permissionsService.create(createPermissionDto, user);
  }

  @ResponseMessage('Lấy danh sách quyền')
  @Public()
  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.permissionsService.findAll(+currentPage, +limit, qs);
  }

  @ResponseMessage('Lấy thông tin quyền theo id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @ResponseMessage('Cập nhật thông tin quyền')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @UserReq() user: IUser,
  ) {
    return this.permissionsService.update(id, updatePermissionDto, user);
  }

  @ResponseMessage('Xóa quyền theo id')
  @Delete(':id')
  remove(@Param('id') id: string, @UserReq() user: IUser) {
    return this.permissionsService.remove(id, user);
  }
}
