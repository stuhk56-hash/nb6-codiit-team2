import { Test, TestingModule } from '@nestjs/testing';
import { MetadataController } from '../../src/modules/metadata/metadata.controller';
import { MetadataService } from '../../src/modules/metadata/metadata.service';

describe('MetadataController', () => {
  let controller: MetadataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetadataController],
      providers: [{ provide: MetadataService, useValue: {} }],
    }).compile();

    controller = module.get<MetadataController>(MetadataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
