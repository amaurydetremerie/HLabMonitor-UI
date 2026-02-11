import { TargetIdDto } from './targetIdDto';

export interface TargetDto {
  id: TargetIdDto;
  type: TargetDtoType;
  target: string;
  interval: string;
}
export enum TargetDtoType {
  Ping= 'PING',
  Certificate= 'CERTIFICATE',
  Http= 'HTTP',
  Speedtest= 'SPEEDTEST',
  Unknown= 'UNKNOWN'
}
