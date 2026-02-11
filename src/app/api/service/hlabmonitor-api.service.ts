import { Injectable } from '@angular/core';
import {map, Observable} from 'rxjs';
import {
  CheckResultsService,
  CheckTargetIdsService, ManageTargetsService,
  PageResponseTargetResult, Statistics,
  TargetId,
  TargetResult
} from '../../generated-api';
import {
  TargetResultDto,
  TargetIdDto,
  PageResponseTargetResultDto,
  StatisticsDto,
  SubStatisticsDto,
  StatisticsDtoType,
  TargetDtoType,
  TargetResultDtoType
} from '../model/modelsDto';

@Injectable({ providedIn: 'root' })
export class HLabMonitorApiService {
  constructor(
    private readonly checkResultsService: CheckResultsService,
    private readonly checkTargetIdsService: CheckTargetIdsService,
    private readonly manageTargetsService: ManageTargetsService
  ) {}

  findAllTargetResultDto() : Observable<Array<TargetResultDto>> {
    return this.checkResultsService.getAll1().pipe(
      map((generated: TargetResult[]) => generated.map(this.toTargetResultDto))
    );
  }

  getAllTargetResultDtoByTargetIdDto(
    targetIdDto: TargetIdDto
  ) : Observable<Array<TargetResultDto>> {
    return this.checkResultsService.getAllByTargetId(targetIdDto.id).pipe(
      map((generated: TargetResult[]) => generated.map(this.toTargetResultDto))
    );
  }

  getAllTargetResultDtoFiltered(
    from?: string,
    to?: string,
    targetIdList?: Array<TargetIdDto>,
    monitoringResultList?: Array<TargetResultDtoType>,
    monitoringTypeList?: Array<TargetDtoType>,
    size?: number,
    page?: number
  ) : Observable<PageResponseTargetResultDto> {
    return this.checkResultsService.getAllFiltered(
      from,
      to,
      this.toTargetIdStringList(targetIdList),
      monitoringResultList,
      monitoringTypeList,
      size,
      page
    ).pipe(
      map((generated: PageResponseTargetResult) => this.toPageResponseTargetResultDto(generated))
    );
  }

  getAllTargetIdDto() : Observable<Array<TargetIdDto>> {
    return this.checkTargetIdsService.getAll().pipe(
      map((generated: TargetId[]) => generated.map(this.toTargetIdDto))
    );
  }

  getAllTargetIdDtoByTargetDtoType(type: TargetDtoType) : Observable<Array<TargetIdDto>> {
    return this.checkTargetIdsService.getAllByType(type).pipe(
      map((generated: TargetId[]) => generated.map(this.toTargetIdDto))
    );
  }

  getAllStatistics() : Observable<StatisticsDto> {
    return this.manageTargetsService.getStatistics([Statistics.TypeEnum.General])
      .pipe(
        map((generated: Statistics) => this.toStatisticsDto(generated))
      );
  }

  private toTargetResultDto(generated: TargetResult): TargetResultDto {
    if(generated?.id == undefined ||
      generated?.result == undefined ||
      generated?.message == undefined ||
      generated?.checkedAt == undefined)
      throw new Error("An error occured");
    return {
      id: this.toTargetIdDto(generated.id),
      result: this.toTargetResultDtoResultEnum(generated.result),
      message: generated.message,
      checkedAt: generated.checkedAt,
    };
  }

  private toTargetIdDto(generated: TargetId): TargetIdDto {
    if(generated.id == undefined)
      throw new Error("An error occured");
    return {
      id: generated.id,
    };
  }

  private toTargetResultDtoResultEnum(generated: TargetResult.ResultEnum): TargetResultDtoType {
    switch(generated) {
      case "SUCCESS":
        return TargetResultDtoType.Success;
      case "FAILURE":
        return TargetResultDtoType.Failure;
      case "WARNING":
        return TargetResultDtoType.Warning;
      case "ERROR":
        return TargetResultDtoType.Error;
      case "UNKNOWN":
        this.throwError(generated);
      default:
        return this.assertUnreachable(generated);
    }
  }

  private toPageResponseTargetResultDto(generated: PageResponseTargetResult): PageResponseTargetResultDto {
    if(generated?.page == undefined ||
      generated?.size == undefined ||
      generated?.hasNext == undefined ||
      generated?.totalElements == undefined ||
      generated?.content == undefined)
      throw new Error("An error occured");
    return {
      content: generated.content.map((s: TargetResult) => this.toTargetResultDto(s)),
      page: generated.page,
      size: generated.size,
      hasNext: generated.hasNext,
      totalElements: generated.totalElements
    }
  }

  private toTargetIdStringList(targetIdList: Array<TargetIdDto> | undefined): string[] | undefined {
    if (targetIdList == undefined)
      return undefined;
    return targetIdList.map((s: TargetIdDto) => s.id)
  }

  private toStatisticsDto(generated: Statistics) : StatisticsDto {
    if(generated.type == undefined || generated.statistics == undefined || Object.keys(generated.statistics).length === 0)
      throw new Error("An error occured");
    return {
      type: this.toStatisticsDtoType(generated.type),
      statistics: this.toStatisticsDtoArray(generated.statistics)
    };
  }

  private toStatisticsDtoArray(statistics: { [p: string]: number }) : Array<SubStatisticsDto> {
    let array: SubStatisticsDto[] = [];
    for (const [key, value] of Object.entries(statistics)) {
      array.push({
        type: this.toStatisticsDtoType(key as StatisticsDtoType),
        value: value
      });
    }
    return array;
  }

  private toStatisticsDtoType(generated: Statistics.TypeEnum) : StatisticsDtoType {
    switch(generated) {
      case "GENERAL":
        return StatisticsDtoType.General
      case "TARGET":
        return StatisticsDtoType.Target
      case "RESULT":
        return StatisticsDtoType.Result
      case "NOTIFICATION":
        return StatisticsDtoType.Notification
      case "RESULT_SUCCESS":
        return StatisticsDtoType.ResultSuccess
      case "RESULT_FAILURE":
        return StatisticsDtoType.ResultFailure
      case "RESULT_WARNING":
        return StatisticsDtoType.ResultWarning
      case "RESULT_ERROR":
        return StatisticsDtoType.ResultError
      case "TARGET_PING":
        return StatisticsDtoType.TargetPing
      case "TARGET_CERTIFICATE":
        return StatisticsDtoType.TargetCertificate
      case "TARGET_HTTP":
        return StatisticsDtoType.TargetHttp
      case "TARGET_SPEEDTEST":
        return StatisticsDtoType.TargetSpeedtest
      case "NOTIFICATION_SEND":
        return StatisticsDtoType.NotificationSend
      case "NOTIFICATION_TRIGGER":
        return StatisticsDtoType.NotificationTrigger
      case "UNKNOWN":
        this.throwError(generated);
      default:
        return this.assertUnreachable(generated);
    }
  }

  private assertUnreachable(x: never): never {
    this.throwError(x);
  }

  private throwError(x: unknown) : never {
    throw new Error(`Unexpected enum value: ${x}`);
  }
}
