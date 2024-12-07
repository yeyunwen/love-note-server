import { Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BindLoverDto } from './dto/bind-lover.dto';
import { UnbindLoverDto } from './dto/unbind-lover.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiController } from '../common/decorators/api-controller.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('用户')
@ApiController('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '创建用户' })
  @Post()
  @Public()
  async register(@Body() registerDto: RegisterDto) {
    await this.userService.register(registerDto);
    return '注册成功';
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
}
