import type { Response } from 'express';

export class NotificationHub {
  private readonly clients = new Map<string, Set<Response>>();

  add(userId: string, res: Response) {
    const clients = this.clients.get(userId) ?? new Set<Response>();
    clients.add(res);
    this.clients.set(userId, clients);
  }

  remove(userId: string, res: Response) {
    const clients = this.clients.get(userId);
    if (!clients) {
      return;
    }

    clients.delete(res);
    if (clients.size === 0) {
      this.clients.delete(userId);
    }
  }

  emit(userId: string, data: unknown) {
    const clients = this.clients.get(userId);
    if (!clients || clients.size === 0) {
      return;
    }

    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const res of clients) {
      res.write(payload);
    }
  }
}

export const notificationHub = new NotificationHub();
