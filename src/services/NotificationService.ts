import { AppDataSource } from '../config/database';
import { Product } from '../models/Product';
import { config } from '../config/env';

export class NotificationService {
  /**
   * Envia notificação para os usuários quando o estoque atinge ou cai abaixo do mínimo,
   * ou quando esgota completamente.
   */
  async sendLowStockAlert(product: Product, newQuantity: number): Promise<void> {
    try {
      // 1. Coletar e-mails dos usuários cruzando tabelas de autenticação e almoxarifado
      const query = `
        SELECT DISTINCT e.email
        FROM almoxarifado.allowed_users au
        JOIN autenticacao.usuarios u ON au.matricula = u.matricula
        JOIN autenticacao.emails e ON u.matricula = e.matricula
        WHERE e.authorized_notifications_apps @> '["almoxarifado_ti"]'::jsonb
      `;

      const results = await AppDataSource.query(query);
      
      const emails: string[] = results.map((row: any) => row.email).filter(Boolean);

      if (emails.length === 0) {
        console.log('[NotificationService] Nenhum e-mail com permissão de notificação encontrado.');
        return;
      }

      // 2. Montar Payload
      let subject = `Alerta de Estoque: ${product.name}`;
      let title = `Aviso de Estoque Crítico`;
      let message = `O produto "${product.name}" atingiu nível crítico de estoque. Quantidade atual: ${newQuantity} (Mínimo: ${product.minimal_quantity}).`;

      if (newQuantity === 0) {
        subject = `Estoque Esgotado: ${product.name}`;
        title = `Aviso de Estoque Esgotado`;
        message = `O produto "${product.name}" está com estoque zerado!`;
      }

      const payload = {
        to: emails,
        subject,
        title,
        message,
        application: "Almoxarifado TI"
      };

      // 3. Disparar Requisição (assíncrona e não bloqueante)
      // fetch é nativo no Node.js 18+
      fetch(`${config.notification_api}/notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.notification_api_key
        },
        body: JSON.stringify(payload)
      }).then(res => {
        if (!res.ok) {
          console.error(`[NotificationService] Falha ao enviar notificação: ${res.status} ${res.statusText}`);
        } else {
          console.log(`[NotificationService] Notificação de estoque do produto ${product.id} enviada com sucesso.`);
        }
      }).catch(err => {
        console.error(`[NotificationService] Erro na requisição de notificação:`, err);
      });

    } catch (error) {
      console.error('[NotificationService] Erro ao processar envio de alerta de estoque:', error);
    }
  }
}
