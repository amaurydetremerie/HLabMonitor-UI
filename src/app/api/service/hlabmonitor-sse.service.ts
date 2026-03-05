import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment'; // ton path

@Injectable({ providedIn: 'root' })
export class HLabMonitorSseService {

  private readonly apiBaseUrl = environment.apiBaseUrl;

  connectNotificationCount(): Observable<number> {
    const url = `${this.apiBaseUrl}/api/v1/notifications/stream`;

    return new Observable<number>(observer => {
      const es = new EventSource(url);

      es.addEventListener('notifications-count-update', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data) as number;
          observer.next(payload);
        } catch (error) {
          console.error('SSE parse error:', error);
          observer.error(error);
        }
      });

      es.onerror = (err) => {
        console.error('SSE connection error:', err);
        observer.error(err);
      };

      return () => {
        es.close();
      };
    });
  }
}
