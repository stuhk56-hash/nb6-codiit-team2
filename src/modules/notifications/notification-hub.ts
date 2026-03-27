import type { Response } from 'express';

function createNotificationHub() {
  const clients = new Map<string, Set<Response>>();

  const add = (userId: string, res: Response) => {
    const targetClients = clients.get(userId) ?? new Set<Response>();
    targetClients.add(res);
    clients.set(userId, targetClients);
  };

  const remove = (userId: string, res: Response) => {
    const targetClients = clients.get(userId);
    if (!targetClients) {
      return;
    }

    targetClients.delete(res);
    if (targetClients.size === 0) {
      clients.delete(userId);
    }
  };

  const emit = (userId: string, data: unknown) => {
    const targetClients = clients.get(userId);
    if (!targetClients || targetClients.size === 0) {
      return;
    }

    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const res of targetClients) {
      res.write(payload);
    }
  };

  return { add, remove, emit };
}

export const notificationHub = createNotificationHub();
