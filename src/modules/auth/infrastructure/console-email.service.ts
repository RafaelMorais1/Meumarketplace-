import { IEmailService } from '../domain/email-service.interface';

/**
 * Serviço de E-mail para Ambiente de Desenvolvimento (Console)
 * Imprime o link formatado no terminal para testes locais sem requerer provedores SMTP externos.
 */
export class ConsoleEmailService implements IEmailService {
  async sendPasswordResetEmail(toEmail: string, resetLink: string): Promise<void> {
    console.log('\n' + '='.repeat(60));
    console.log('📧 [DEV EMAIL SERVICE] Solicitação de Recuperação de Senha');
    console.log(`Para: ${toEmail}`);
    console.log(`Link: ${resetLink}`);
    console.log('Validade: 30 minutos | Uso único (OWASP ASVS)');
    console.log('='.repeat(60) + '\n');
  }
}
