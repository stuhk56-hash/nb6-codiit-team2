import { metadataRepository } from './metadata.repository';
import { toGradeResponse } from './utils/metadata.mapper';
import { GradeResponseDto } from './dto/grade-response.dto';

export class MetadataService {
  async getGrades(): Promise<GradeResponseDto[]> {
    const grades = await metadataRepository.findAllGrades();
    return grades.map(toGradeResponse);
  }
}

export const metadataService = new MetadataService();
