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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Public, ResponseMessage, UserReq } from '../decorator/customize';
import { IUser } from '../users/users.interface';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ResponseMessage('Tạo role mới')
  @Post()
  create(@Body() createRoleDto: CreateRoleDto, @UserReq() user: IUser) {
    return this.rolesService.create(createRoleDto, user);
  }

  @ResponseMessage('Lấy danh sách role')
  @Public()
  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.rolesService.findAll(+currentPage, +limit, qs);
  }

  @ResponseMessage('Lấy thông tin role theo id')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @ResponseMessage('Cập nhật thông tin role')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @UserReq() user: IUser,
  ) {
    return this.rolesService.update(id, updateRoleDto, user);
  }

  @ResponseMessage('Xóa role theo id')
  @Delete(':id')
  remove(@Param('id') id: string, @UserReq() user: IUser) {
    return this.rolesService.remove(id, user);
  }
}
