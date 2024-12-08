import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { Public } from '~/common/decorators/public.decorator';
import { JwtPayload } from '~/common/types';
import { LoginEmailDto } from './dto/login.dto';
import { SendEmailVerifyCodeDto } from './dto/verify-code.dto';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login/email')
  @ApiOperation({
    summary: '邮箱登录',
  })
  @ApiBody({ type: LoginEmailDto })
  @Public()
  async loginByEmail(@Body() data: LoginEmailDto) {
    const user = await this.authService.loginByEmail(data.email, data.password);
    if (!user) {
      throw new HttpException('用户名或密码错误', HttpStatus.OK);
    }
    const token = this.jwtService.sign({
      userId: user.id,
      uid: user.uid,
      username: user.username,
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
