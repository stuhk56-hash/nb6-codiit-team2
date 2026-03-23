import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { prisma } from '../../../lib/constants/prismaClient';
import { Grade } from '@prisma/client';
import { METADATA_CONSTANTS } from '../constants/metadata.constant';

@Injectable()
export class MetadataSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MetadataSeedService.name);

  /**
   * 앱이 구동될 때 자동으로 실행되는 라이프사이클 훅입니다.
   */
  async onApplicationBootstrap() {
    await this.seedGrades();
  }

  /**
   * 등급 초기 데이터를 생성합니다.
   */
  async seedGrades() {
    this.logger.log('등급(Grades) 메타데이터 시딩 시작...');

    const gradeEntries = Object.values(METADATA_CONSTANTS.GRADES);

    for (const gradeData of gradeEntries) {
      await prisma.grade.upsert({
        where: { id: gradeData.id },
        update: {
          name: gradeData.name,
          rate: gradeData.rate,
          minAmount: gradeData.minAmount,
        },
        create: {
          id: gradeData.id,
          name: gradeData.name,
          rate: gradeData.rate,
          minAmount: gradeData.minAmount,
        },
      });
      this.logger.log(`등급 생성/업데이트 완료: ${gradeData.name}`);
    }

    this.logger.log('등급 메타데이터 시딩 완료.');
  }
}
