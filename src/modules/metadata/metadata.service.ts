import type { GradeResponseDto } from './dto/grade-response.dto';
import { metadataRepository } from './metadata.repository';
import { toGradeResponseDto } from './utils/metadata.mapper';

export class MetadataService {
  async getGrade(): Promise<GradeResponseDto[]> {
    const grades = await metadataRepository.findGrades();
    return grades.map(toGradeResponseDto);
  }
}

export const metadataService = new MetadataService();
