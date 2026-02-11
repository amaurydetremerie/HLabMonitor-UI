import {ChangeDetectionStrategy, Component, computed, effect, inject, signal} from '@angular/core';
import {catchError, distinctUntilChanged, finalize, forkJoin, map, of, switchMap, tap} from 'rxjs';
import {
  TargetDtoType,
  TargetIdDto,
  TargetResultDtoType
} from '../api/model/modelsDto';
import {HLabMonitorApiService} from '../api/service/hlabmonitor-api.service';
import {ButtonModule} from 'primeng/button';
import {DatePickerModule} from 'primeng/datepicker';
import {MultiSelectModule} from 'primeng/multiselect';
import {InputTextModule} from 'primeng/inputtext';
import {TableLazyLoadEvent, TableModule} from 'primeng/table';
import {TagModule} from 'primeng/tag';
import {DatePipe, NgClass} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-monitoring',
  imports: [
    ButtonModule,
    DatePickerModule,
    MultiSelectModule,
    InputTextModule,
    TableModule,
    TagModule,
    DatePipe,
    FormsModule,
    NgClass
  ],
  templateUrl: './monitoring.html',
  styleUrl: './monitoring.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Monitoring {

  private compare(a: string, b: string): number {
    return a.localeCompare(b);
  }
  private defaultFrom(): Date {
    const minus5 = new Date(Date.now() - 5 * 60 * 1000);
    minus5.setSeconds(0, 0);
    return minus5;
  }
  private readonly api = inject(HLabMonitorApiService);

  //TargetDtoType
  readonly typeOptions = signal<TargetDtoType[]>(Object.values(TargetDtoType));
  readonly selectedTypes = signal<TargetDtoType[]>([]);

  //TargetResultDtoType
  readonly resultOptions =  signal<TargetResultDtoType[]>(Object.values(TargetResultDtoType));
  readonly selectedResults = signal<TargetResultDtoType[]>([]);

  //Target
  readonly targetOptions = toSignal(
    toObservable(this.selectedTypes).pipe(
      switchMap((types) => {
        if (!types.length) {
          return this.api.getAllTargetIdDto();
        }
        return forkJoin(types.map(t => this.api.getAllTargetIdDtoByTargetDtoType(t))).pipe(
          map((lists) => lists.flat()));
      })
    ),
    { initialValue: [] as TargetIdDto[] }
  );
  readonly selectedTargets = signal<TargetIdDto[]>([]);

  //Date
  readonly fromDate = signal<Date | null>(this.defaultFrom());
  readonly toDate = signal<Date|null>(null);

  //Combined filters
  readonly filters = computed(() => ({
    from: this.fromDate()?.toISOString(),
    to: this.toDate()?.toISOString(),
    targets: this.selectedTargets().length ? this.selectedTargets()?.toSorted((t1, t2) => this.compare(t1.id, t2.id)) : undefined,
    results: this.selectedResults().length ? this.selectedResults()?.toSorted(this.compare) : undefined,
    types:this.selectedTypes().length ? this.selectedTypes()?.toSorted(this.compare) : undefined
  }));

  //Pagination
  readonly rows = signal<number>(25);
  readonly first = signal<number>(0);
  readonly page = computed(() => Math.floor(this.first() / this.rows()));

  readonly query = computed(() => ({
    from: this.filters().from,
    to: this.filters().to,
    targets: this.filters().targets,
    results: this.filters().results,
    types: this.filters().types,
    size: this.rows(),
    page: this.page()
  }));

  readonly loading = signal<boolean>(true);

  readonly resultsPage = toSignal(
    toObservable(this.query).pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      tap(() => this.loading.set(true)),
      switchMap(q =>
        this.api.getAllTargetResultDtoFiltered(
          q.from,
          q.to,
          q.targets,
          q.results,
          q.types,
          q.size,
          q.page
        ).pipe(
          finalize(() => this.loading.set(false)),
          catchError(() => of({ content: [], page: q.page, size: q.size, hasNext: false, totalElements: 0 }))
        )
      )
    ),
    { initialValue: { content: [], page: 0, size: 25, hasNext: false, totalElements: 0 } }
  );

  //Results
  readonly results = computed(() => this.resultsPage().content);
  readonly totalElements = computed(() => this.resultsPage().totalElements);

  constructor() {
    effect(() => {
      const allowedIds = new Set(this.targetOptions().map(t => t.id));

      this.selectedTargets.update(curr =>
        curr.filter(t => allowedIds.has(t.id))
      );
    });

    effect(() => {
      const _ = this.filters();
      this.first.set(0);
    });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.rows.update(r => event.rows ?? r);
    this.first.set(event.first ?? 0);
  }

  clearFilters(): void {
    this.fromDate.set(this.defaultFrom());
    this.toDate.update(r => r === null ? r : null);
    this.selectedTargets.update(r => r.length === 0 ? r : []);
    this.selectedTypes.update(r => r.length === 0 ? r : []);
    this.selectedResults.update(r => r.length === 0 ? r : []);
    this.first.set(0);
  }

  severity(result: TargetResultDtoType): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (result) {
      case TargetResultDtoType.Success: return 'success';
      case TargetResultDtoType.Warning: return 'warn';
      case TargetResultDtoType.Failure:
      case TargetResultDtoType.Error: return 'danger';
      default: return 'secondary';
    }
  }
}
