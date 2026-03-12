import { Router } from 'express';
import { metadataRouter } from './metadata.controller';

export const MetadataModule = (router: Router) => {
  router.use('/metadata', metadataRouter);
};

export default MetadataModule;
