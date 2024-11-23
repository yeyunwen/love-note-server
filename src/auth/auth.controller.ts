import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { LocalAuthGuard } from './auth.guard';
import type { SafeUserInfo } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtPayload } from '../common/types';
import { LoginUsernameDto } from './dto/login-username.dto';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('login/username')
  @ApiOperation({
    summary: '用户名密码登录',
  })
  @ApiBody({ type: LoginUsernameDto })
  @UseGuards(LocalAuthGuard)
  @Public()
  loginByUsername(@Request() req: { user: SafeUserInfo }) {
    const token = this.jwtService.sign({
      userId: req.user.id,
      username: req.user.username,
    } as JwtPayload);
    return { token };
  }
}
