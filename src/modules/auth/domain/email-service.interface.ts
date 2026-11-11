/**
 * Interface do Serviço de E-mail (Porta de Saída)
 * Desacopla a aplicação do meio de envio (Console/SMTP/Resend/SES).
 */
export interface IEmailService {
  sendPasswordResetEmail(toEmail: string, resetLink: string): Promise<void>;
}

