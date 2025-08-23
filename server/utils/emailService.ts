import nodemailer from 'nodemailer';
import { PasswordResetTokenModel } from '../models/PasswordResetToken';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface SendOTPEmailOptions {
  to: string;
  otp: string;
  userName: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Inicializa o transportador de email com as configurações do .env
   */
  private static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      const config: EmailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true para 465, false para outras portas
        auth: {
          user: process.env.SMTP_USERNAME || '',
          pass: process.env.SMTP_PASSWORD || '',
        },
      };

      this.transporter = nodemailer.createTransport(config);
    }

    return this.transporter!;
  }

  /**
   * Envia um email com o código OTP para recuperação de senha
   */
  static async sendPasswordResetOTP(options: SendOTPEmailOptions): Promise<boolean> {
    try {
      const transporter = this.getTransporter();

      const mailOptions = {
        from: {
          name: 'AgroCrédito',
          address: process.env.SMTP_USERNAME || 'noreply@agrocredito.ao',
        },
        to: options.to,
        subject: 'Código de Recuperação de Palavra-passe - AgroCrédito',
        html: this.generatePasswordResetEmailHTML(options.otp, options.userName),
        text: this.generatePasswordResetEmailText(options.otp, options.userName),
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Email enviado com sucesso:', result.messageId);
      return true;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return false;
    }
  }

  /**
   * Gera o conteúdo HTML do email de recuperação de senha
   */
  private static generatePasswordResetEmailHTML(otp: string, userName: string): string {
    return `
      <!DOCTYPE html>
      <html lang="pt">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperação de Palavra-passe</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #22c55e;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .otp-code {
            background-color: #22c55e;
            color: white;
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            letter-spacing: 8px;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌱 AgroCrédito</h1>
          <p>Recuperação de Palavra-passe</p>
        </div>
        
        <div class="content">
          <h2>Olá, ${userName}!</h2>
          
          <p>Recebemos uma solicitação para redefinir a palavra-passe da sua conta no AgroCrédito.</p>
          
          <p>Use o código abaixo para continuar com a recuperação:</p>
          
          <div class="otp-code">
            ${otp}
          </div>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul>
              <li>Este código é válido por apenas <strong>15 minutos</strong></li>
              <li>Não partilhe este código com ninguém</li>
              <li>Se não solicitou esta recuperação, ignore este email</li>
            </ul>
          </div>
          
          <p>Se tiver alguma dúvida, entre em contacto connosco através do nosso suporte.</p>
          
          <p>Atenciosamente,<br>
          <strong>Equipa AgroCrédito</strong></p>
        </div>
        
        <div class="footer">
          <p>Este é um email automático, não responda a esta mensagem.</p>
          <p>© 2024 AgroCrédito - Sistema de Gestão de Crédito Agrícola</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Gera o conteúdo de texto simples do email de recuperação de senha
   */
  private static generatePasswordResetEmailText(otp: string, userName: string): string {
    return `
AgroCrédito - Recuperação de Palavra-passe

Olá, ${userName}!

Recebemos uma solicitação para redefinir a palavra-passe da sua conta no AgroCrédito.

Use o código abaixo para continuar com a recuperação:

Código: ${otp}

IMPORTANTE:
- Este código é válido por apenas 15 minutos
- Não partilhe este código com ninguém
- Se não solicitou esta recuperação, ignore este email

Se tiver alguma dúvida, entre em contacto connosco através do nosso suporte.

Atenciosamente,
Equipa AgroCrédito

---
Este é um email automático, não responda a esta mensagem.
© 2024 AgroCrédito - Sistema de Gestão de Crédito Agrícola
    `;
  }

  /**
   * Testa a configuração do email
   */
  static async testEmailConfiguration(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      console.log('Configuração de email válida');
      return true;
    } catch (error) {
      console.error('Erro na configuração de email:', error);
      return false;
    }
  }
}