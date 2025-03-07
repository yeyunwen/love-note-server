import { Post, Body, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AcceptLoverDto,
  BindLoverDto,
  RejectLoverDto,
} from './dto/bind-lover.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiController } from '~/common/decorators/api-controller.decorator';
import { Public } from '~/common/decorators/public.decorator';
import { User } from '~/common/decorators/user.decorator';
import { JwtPayload } from '~/common/types';

@ApiTags('用户')
@ApiController('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '获取用户信息' })
  @Get('me')
  async getUserInfo(@User() user: JwtPayload) {
    return await this.userService.getUserInfo(user.uid);
  }

  @ApiOperation({ summary: '创建用户' })
  @Post()
  @Public()
  async register(@Body() registerDto: RegisterDto) {
    await this.userService.register(registerDto);
    return '注册成功';
  }

  @ApiOperation({ summary: '绑定恋人' })
  @Post('lover/bind')
  async bindLover(
    @Body() bindLoverDto: BindLoverDto,
    @User() user: JwtPayload,
  ) {
    await this.userService.sendLoverRequest(user.uid, bindLoverDto.loverUid);
    return '绑定请求发送成功';
  }

  @ApiOperation({ summary: '接受恋人请求' })
  @Post('lover/accept')
  async acceptLoverRequest(
    @Body() acceptLoverDto: AcceptLoverDto,
    @User() user: JwtPayload,
  ) {
    await this.userService.handleLoverRequest(
      user.uid,
      acceptLoverDto.requestId,
      true,
    );
    return '接受请求成功';
  }

  @ApiOperation({ summary: '拒绝恋人请求' })
  @Post('lover/reject')
  async rejectLoverRequest(
    @Body() rejectLoverDto: RejectLoverDto,
    @User() user: JwtPayload,
  ) {
    await this.userService.handleLoverRequest(
      user.uid,
      rejectLoverDto.requestId,
      false,
    );
    return '拒绝请求成功';
  }

  @ApiOperation({ summary: '解除恋人绑定' })
  @Post('lover/unbind')
  async unbindLover(@User() user: JwtPayload) {
    await this.userService.unbindLover(user.uid);
    return '解除绑定成功';
  }

  @ApiOperation({ summary: '插入测试用户' })
  @Post('test/insert')
  async insertTestUser() {
    await this.userService.insertTestUser();
    return '插入测试用户成功';
  }
}
