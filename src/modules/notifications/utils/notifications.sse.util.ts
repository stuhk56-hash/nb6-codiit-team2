import type { Response } from 'express';

export function initializeNotificationSse(res: Response) {
  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();
}

export function writeNotificationSseData(res: Response, data: unknown) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}
