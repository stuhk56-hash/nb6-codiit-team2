import type { GradeResponseDto } from '../dto/grade-response.dto';
import type { GradeRow } from '../types/metadata.type';

export function toGradeResponseDto(grade: GradeRow): GradeResponseDto {
  return {
    name: grade.name,
    id: grade.id,
    rate: grade.rate,
    minAmount: grade.minAmount,
  };
}
