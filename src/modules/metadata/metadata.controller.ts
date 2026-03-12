import { Request, Response, Router } from 'express';

export const getMetadata = async (req: Request, res: Response) => {
  res.json({ message: 'This is the metadata endpoint.' });
};

export const metadataRouter = Router();

metadataRouter.get('/', getMetadata);
