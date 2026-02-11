export interface StatisticsDto {
  type: StatisticsDtoType;
  statistics: Array<SubStatisticsDto>;
}

export interface SubStatisticsDto {
  type: StatisticsDtoType;
  value: number;
}

export enum StatisticsDtoType {
  General= 'GENERAL',
  Target= 'TARGET',
  Result= 'RESULT',
  Notification= 'NOTIFICATION',
  ResultSuccess= 'RESULT_SUCCESS',
  ResultFailure= 'RESULT_FAILURE',
  ResultWarning= 'RESULT_WARNING',
  ResultError= 'RESULT_ERROR',
  TargetPing= 'TARGET_PING',
  TargetCertificate= 'TARGET_CERTIFICATE',
  TargetHttp= 'TARGET_HTTP',
  TargetSpeedtest= 'TARGET_SPEEDTEST',
  NotificationSend= 'NOTIFICATION_SEND',
  NotificationTrigger= 'NOTIFICATION_TRIGGER'
}
