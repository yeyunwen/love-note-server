import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { LocalAuthGuard } from './auth.guard';
import { AuthService, SafeUserInfo } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { JwtPayload } from '../common/types';
import { LoginUsernameDto } from './dto/login-username.dto';
import { SendEmailVerifyCodeDto } from './dto/verify-code.dto';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

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

  @Post('send-verify-code/email')
  @ApiOperation({
    summary: '发送邮箱验证码',
  })
  @Public()
  sendEmailVerifyCode(@Body() data: SendEmailVerifyCodeDto) {
    return this.authService.sendEmailVerifyCode(data.address);
  }
}
