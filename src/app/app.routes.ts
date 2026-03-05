import { Routes } from '@angular/router';
import {Monitoring} from './monitoring/monitoring';
import {Home} from './home/home';

export const routes: Routes = [
  {path: 'monitoring', component: Monitoring},
  {path: 'monitoring/:id', component: Monitoring},
  {path: '', component: Home},
  {path: 'home', redirectTo: ''},
  {path: '**', redirectTo: ''}
];
