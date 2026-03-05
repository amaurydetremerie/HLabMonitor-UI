import {ChangeDetectionStrategy, Component, inject, OnDestroy, signal, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MenubarModule} from 'primeng/menubar';
import {BadgeModule} from 'primeng/badge';
import {ListboxModule} from 'primeng/listbox';
import {Button, ButtonModule} from 'primeng/button';
import {Popover, PopoverModule} from 'primeng/popover';
import {MenuItem} from 'primeng/api';
import {Subscription} from 'rxjs';
import {HLabMonitorApiService} from '../api/service/hlabmonitor-api.service';
import {HLabMonitorSseService} from '../api/service/hlabmonitor-sse.service';
import {NotificationDto} from '../api/model/notificationDto';
import {OverlayBadgeModule} from 'primeng/overlaybadge';
import {RouterLink} from '@angular/router';
import {TargetResultDtoType} from '../api/model/targetResultDto';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    MenubarModule,
    BadgeModule,
    ListboxModule,
    ButtonModule,
    PopoverModule,
    OverlayBadgeModule,
    RouterLink
  ],
  templateUrl: './menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Menu implements OnDestroy {
  @ViewChild('notificationOverlay') notificationOverlay!: Popover;
  @ViewChild('bellBtn') bellButton!: Button;

  items: MenuItem[] = [];
  notificationCount = signal(0);
  activeNotifications = signal<NotificationDto[]>([]);

  private readonly api = inject(HLabMonitorApiService);
  private readonly sse = inject(HLabMonitorSseService);

  private readonly sseSubscription?: Subscription;

  constructor() {
    this.items = [
      { label: 'Home', icon: 'pi pi-home', routerLink: '/home' },
      { label: 'Monitoring', icon: 'pi pi-desktop', routerLink: '/monitoring' },
      { label: 'Github', icon: 'pi pi-github', url: 'https://github.com/amaurydetremerie/HLabMonitor' }
    ];

    this.sseSubscription = this.sse.connectNotificationCount()
      .subscribe(count => this.notificationCount.set(count));
  }

  onBellClick(event: Event) {
    this.api.getActiveNotifications()
      .subscribe(notifications => {
        this.activeNotifications.set(notifications);
        this.notificationOverlay.toggle(event, this.bellButton.el.nativeElement);
      });
  }

  ngOnDestroy() {
    this.sseSubscription?.unsubscribe();
  }

  iconFor(n: TargetResultDtoType): string {
    switch (n) {
      case 'SUCCESS': return 'pi pi-check';
      case 'WARNING': return 'pi pi-exclamation-triangle';
      case 'FAILURE': return 'pi pi-times';
      case 'ERROR':   return 'pi pi-bolt';
      default:        return '';
    }
  }

  colorFor(n: TargetResultDtoType): string {
    switch (n) {
      case 'SUCCESS': return 'border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-950/30';
      case 'WARNING': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-700/40 dark:bg-yellow-800/30';
      case 'FAILURE': return 'border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/30';
      case 'ERROR':   return 'border-red-400 bg-red-200 dark:border-red-900/40 dark:bg-red-950/30';
      default:        return '';
    }
  }
}
