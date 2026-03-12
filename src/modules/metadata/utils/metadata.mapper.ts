import { Grade } from '@prisma/client';
import { GradeResponseDto } from '../dto/grade-response.dto';

export function toGradeResponse(grade: Grade): GradeResponseDto {
  console.log(grade);
  return new GradeResponseDto(grade);
}
