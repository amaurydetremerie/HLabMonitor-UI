import {TargetIdDto} from './targetIdDto';

export interface TargetResultDto {
  id: TargetIdDto;
  result: TargetResultDtoType;
  message: string;
  checkedAt: string;
}
export enum TargetResultDtoType {
  Success= 'SUCCESS',
  Failure= 'FAILURE',
  Warning= 'WARNING',
  Error= 'ERROR',
  Unknown= 'UNKNOWN'
}
