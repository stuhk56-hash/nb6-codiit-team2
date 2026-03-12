import { prisma } from '../../lib/constants/prismaClient';

function findAllGrades() {
  return prisma.grade.findMany({
    orderBy: { minAmount: 'asc' },
  });
}

export const metadataRepository = {
  findAllGrades,
};
