import { metadataRepository } from './metadata.repository';
import { GradeResponseDto } from './dto/grade-response.dto';

export class MetadataService {
  async getGrades(): Promise<GradeResponseDto[]> {
    const grades = await metadataRepository.findAllGrades();
    return grades.map((grade) => new GradeResponseDto(grade));
  }
}

export const metadataService = new MetadataService();
