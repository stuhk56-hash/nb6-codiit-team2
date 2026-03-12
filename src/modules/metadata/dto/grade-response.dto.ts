import { Grade } from '@prisma/client';

export class GradeResponseDto {
  /**
   * 등급 ID
   * @example "grade_green"
   */
  id: string;

  /**
   * 등급 이름
   * @example "Green"
   */
  name: string;

  /**
   * 적립률(%)
   * @example 1
   */
  rate: number;

  /**
   * 해당 등급 최소 누적 구매금액
   * @example 0
   */
  minAmount: number;

  constructor(grade: Grade) {
    this.id = grade.id;
    this.name = grade.name;
    this.rate = grade.rate;
    this.minAmount = grade.minAmount;
  }
}
