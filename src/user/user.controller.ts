import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BindLoverDto } from './dto/bind-lover.dto';
import { UnbindLoverDto } from './dto/unbind-lover.dto';

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '创建用户' })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    await this.userService.create(createUserDto);
    return '创建成功';
  }

  @ApiOperation({ summary: '绑定恋人' })
  @Post('lover/bind')
  async bindLover(@Body() bindLoverDto: BindLoverDto) {
    await this.userService.bindLover(
      bindLoverDto.userUid,
      bindLoverDto.loverUid,
    );
    return '绑定成功';
  }

  @ApiOperation({ summary: '解除恋人绑定' })
  @Post('lover/unbind')
  async unbindLover(@Body() unbindLoverDto: UnbindLoverDto) {
    await this.userService.unbindLover(unbindLoverDto.uid);
    return '解除绑定成功';
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
