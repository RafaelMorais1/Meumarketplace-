import { IEmailService } from '@/modules/auth/domain/email-service.interface';

export class FakeEmailService implements IEmailService {
  public sentEmails: Array<{ toEmail: string; resetLink: string }> = [];

  async sendPasswordResetEmail(toEmail: string, resetLink: string): Promise<void> {
    this.sentEmails.push({ toEmail, resetLink });
  }
}

