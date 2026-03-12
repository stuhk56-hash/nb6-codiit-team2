import { prisma } from '../../lib/constants/prismaClient';

export class MetadataRepository {
  findAllGrades() {
    return prisma.grade.findMany({
      orderBy: { minAmount: 'asc' },
    });
  }
}

export const metadataRepository = new MetadataRepository();
