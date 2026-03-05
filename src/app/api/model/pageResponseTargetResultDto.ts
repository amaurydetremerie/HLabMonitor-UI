import {TargetResultDto} from './targetResultDto';

export interface PageResponseTargetResultDto {
    content: Array<TargetResultDto>;
    page: number;
    size: number;
    totalElements: number;
    hasNext: boolean;
}

