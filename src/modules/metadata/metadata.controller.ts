import { Request, Response, Router } from 'express';
import { metadataService } from './metadata.service';

export const getMetadata = async (req: Request, res: Response) => {
  try {
    const grades = await metadataService.getGrades();
    const metadata = {
      name: 'My API',
      version: '1.0.0',
      description: 'This is a sample API for demonstration purposes.',
      endpoints: [
        { method: 'GET', path: '/metadata', description: 'Get API metadata' },
      ],
      grades: grades,
    };
    res.json(metadata);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve metadata' });
  }
};

export const metadataRouter = Router();
metadataRouter.get('/', getMetadata);
