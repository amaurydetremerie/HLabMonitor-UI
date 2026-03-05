import {Component, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Menu} from './menu/menu';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menu],
  templateUrl: './app.html'
})
export class App {
  protected readonly title = signal('HLabMonitor-UI');
}
