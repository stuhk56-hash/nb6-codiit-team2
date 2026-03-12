import { Grade } from '@prisma/client';

export class GradeResponseDto {
  /**
   * 등급 ID
   * @example "grade_green"
   */
  readonly id: string;

  /**
   * 등급 이름
   * @example "Green"
   */
  readonly name: string;

  /**
   * 적립률(%)
   * @example 1
   */
  readonly rate: number;

  /**
   * 해당 등급 최소 누적 구매금액
   * @example 0
   */
  readonly minAmount: number;

  constructor(grade: Grade) {
    this.id = grade.id;
    this.name = grade.name;
    this.rate = grade.rate;
    this.minAmount = grade.minAmount;
  }
}
