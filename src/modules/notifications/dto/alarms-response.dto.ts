import type { AlarmDto } from './alarm.dto';

export type AlarmsResponseDto = {
  list: AlarmDto[];
  totalCount: number;
};
