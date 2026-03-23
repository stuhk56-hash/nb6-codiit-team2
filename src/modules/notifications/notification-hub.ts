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

  has(userId: string) {
    return this.clients.has(userId);
  }
}

export const notificationHub = new NotificationHub();
