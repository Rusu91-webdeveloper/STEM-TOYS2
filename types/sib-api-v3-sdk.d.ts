declare module "sib-api-v3-sdk" {
  export namespace ApiClient {
    export const instance: any;
  }

  export class TransactionalEmailsApi {
    sendTransacEmail(
      sendSmtpEmail: SendSmtpEmail
    ): Promise<{ messageId: string }>;
  }

  export class SendSmtpEmail {
    to: Array<{ email: string; name?: string }>;
    subject: string;
    htmlContent: string;
    textContent?: string;
    sender: { email: string; name: string };
    params?: Record<string, any>;
    templateId?: number;
  }
}
