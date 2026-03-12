import { Router } from 'express';

export * from './metadata.controller';

export const MetadataModule = (router: Router) => {
  router.get('/metadata', async (req, res) => {
    try {
      const metadata = {
        name: 'My API',
        version: '1.0.0',
        description: 'This is a sample API for demonstration purposes.',
        endpoints: [
          { method: 'GET', path: '/metadata', description: 'Get API metadata' },
          // Add more endpoints as needed
        ],
      };
      res.json(metadata);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve metadata' });
    }
  });
};

export default MetadataModule;
