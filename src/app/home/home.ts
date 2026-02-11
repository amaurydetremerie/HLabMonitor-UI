import {AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, signal, ViewChild} from '@angular/core';
import {StatisticsDto, StatisticsDtoType} from '../api/model/StatisticsDto';
import {HLabMonitorApiService} from '../api/service/hlabmonitor-api.service';
import {finalize} from 'rxjs';
import {CommonModule, DatePipe, DecimalPipe, NgClass} from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-home',
  imports: [
    ButtonModule,
    CardModule,
    NgClass,
    DecimalPipe,
    DatePipe,
    ChartModule,
    CommonModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Home implements AfterViewInit {
  @ViewChild('swSuccess', { static: true }) swSuccess!: ElementRef<HTMLElement>;
  @ViewChild('swWarning', { static: true }) swWarning!: ElementRef<HTMLElement>;
  @ViewChild('swFailure', { static: true }) swFailure!: ElementRef<HTMLElement>;
  @ViewChild('swError',   { static: true }) swError!: ElementRef<HTMLElement>;

  private bg(el: ElementRef<HTMLElement>): string {
    return getComputedStyle(el.nativeElement).backgroundColor;
  }

  private readonly chartColors = signal<string[] | null>(null);

  ngAfterViewInit(): void {
    this.chartColors.set([
      this.bg(this.swSuccess),
      this.bg(this.swWarning),
      this.bg(this.swFailure),
      this.bg(this.swError),
    ]);
  }

  statusChartData = computed(() => {
    const colors = this.chartColors();
    return {
      labels: ['Success', 'Warning', 'Failure', 'Error'],
      datasets: [{
        data: [
          this.valueOf(StatisticsDtoType.ResultSuccess),
          this.valueOf(StatisticsDtoType.ResultWarning),
          this.valueOf(StatisticsDtoType.ResultFailure),
          this.valueOf(StatisticsDtoType.ResultError)
        ],
        backgroundColor: colors ?? ['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)'],
        borderWidth: 0
      }]
    };
  });
  statusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      arc: {
        borderWidth: 0
      }
    }
  };

  loading = signal(true);
  lastRefresh = signal<Date | null>(null);
  dto = signal<StatisticsDto | null>(null);

  index = computed(() => {
    const map = new Map<StatisticsDtoType, number>();
    const stats = this.dto()?.statistics ?? [];
    for (const s of stats) map.set(s.type, s.value);
    return map;
  });

  valueOf = (type: StatisticsDtoType) => this.index().get(type) ?? 0;


  resultTiles = computed(() => ([
    { label: 'Success', value: this.valueOf(StatisticsDtoType.ResultSuccess), icon: 'pi pi-check', severity: 'success' as const },
    { label: 'Warnings', value: this.valueOf(StatisticsDtoType.ResultWarning), icon: 'pi pi-exclamation-triangle', severity: 'warning' as const },
    { label: 'Failures', value: this.valueOf(StatisticsDtoType.ResultFailure), icon: 'pi pi-times', severity: 'danger' as const },
    { label: 'Errors', value: this.valueOf(StatisticsDtoType.ResultError), icon: 'pi pi-bolt', severity: 'error' as const }
  ]));

  targetTiles = computed(() => ([
    { label: 'Ping', value: this.valueOf(StatisticsDtoType.TargetPing), icon: 'pi pi-wifi' },
    { label: 'HTTP', value: this.valueOf(StatisticsDtoType.TargetHttp), icon: 'pi pi-globe' },
    { label: 'Certificate', value: this.valueOf(StatisticsDtoType.TargetCertificate), icon: 'pi pi-shield' },
    { label: 'Speedtests', value: this.valueOf(StatisticsDtoType.TargetSpeedtest), icon: 'pi pi-gauge' }
  ]));

  constructor(private readonly api: HLabMonitorApiService) {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.api.getAllStatistics()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((dto: StatisticsDto) => {
        this.dto.set(dto);
        this.lastRefresh.set(new Date());
      });
  }
}
