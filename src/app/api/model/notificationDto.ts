import {TargetIdDto} from './targetIdDto';
import {TargetResultDtoType} from './targetResultDto';

export interface NotificationDto {
  notificationId: number;
  targetId: TargetIdDto;
  notificationStatus: NotificationStatusDto;
  fireAt: string;
  resolvedAt: string|undefined;
  oldMonitoringResult: TargetResultDtoType;
  newMonitoringResult: TargetResultDtoType|undefined;
}
export enum NotificationStatusDto {
  ToSend= 'TO_SEND',
  Send= 'SEND',
  ToTerminate= 'TO_TERMINATE',
  Terminated= 'TERMINATED',
  Failed= 'FAILED'
}
