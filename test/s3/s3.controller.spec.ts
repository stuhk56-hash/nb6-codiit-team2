import { Test, TestingModule } from '@nestjs/testing';
import { S3Controller } from '../../src/modules/s3/s3.controller';
import { S3Service } from '../../src/modules/s3/s3.service';

describe('S3Controller', () => {
  let controller: S3Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [S3Controller],
      providers: [{ provide: S3Service, useValue: {} }],
    }).compile();

    controller = module.get<S3Controller>(S3Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
