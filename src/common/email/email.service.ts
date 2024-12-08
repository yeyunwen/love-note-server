import { createTransport, Transporter } from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '~/common/types';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private EMAIL_CONFIG: AppConfig['EMAIL_CONFIG'];

  constructor(private config: ConfigService<AppConfig, true>) {
    this.EMAIL_CONFIG = this.config.get('EMAIL_CONFIG', { infer: true });

    this.transporter = createTransport({
      host: 'smtp.qq.com',
      port: 587,
      secure: false,
      auth: {
        user: this.EMAIL_CONFIG.USER,
        pass: this.EMAIL_CONFIG.PASS,
      },
    });
  }

  async sendMail({ to, subject, html }) {
    await this.transporter.sendMail({
      from: {
        name: '系统邮件',
        address: this.EMAIL_CONFIG.USER,
      },
      to,
      subject,
      html,
    });
  }
}
