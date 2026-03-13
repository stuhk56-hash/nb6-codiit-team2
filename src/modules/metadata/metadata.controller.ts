import type { Request, Response } from 'express';
import { metadataService } from './metadata.service';

export async function getGrade(_: Request, res: Response) {
  const grades = await metadataService.getGrade();
  res.send(grades);
}
