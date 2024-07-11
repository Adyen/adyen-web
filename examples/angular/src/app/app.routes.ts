import { Routes } from '@angular/router';
import { SessionsFlow } from '../components/sessions-flow/sessions.component';
import { AdvancedFlow } from '../components/advanced-flow/advanced.component';

export const routes: Routes = [
    { path: 'sessions-flow', component: SessionsFlow },
    { path: 'advanced-flow', component: AdvancedFlow },
    { path: '', pathMatch: 'full', redirectTo: '/sessions-flow' },
    { path: '**', redirectTo: '/sessions-flow' }
];
