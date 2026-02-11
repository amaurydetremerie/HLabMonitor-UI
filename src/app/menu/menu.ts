import {Component, OnInit} from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import {MenuItem} from 'primeng/api';

@Component({
  selector: 'app-menu',
  imports: [MenubarModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu implements OnInit {
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: '/home'
      },
      {
        label: 'Monitoring',
        icon: 'pi pi-desktop',
        routerLink: '/monitoring'
      },
      {
        label: 'Github',
        icon: 'pi pi-github',
        url: 'https://github.com/amaurydetremerie/HLabMonitor'
      }
    ];
  }
}
