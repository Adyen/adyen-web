import { Routes } from '@angular/router';
import { SessionsFlow } from '../components/sessions-flow/sessions.component';
import { AdvancedFlow } from '../components/advanced-flow/advanced.component';
import { RedirectPage } from '../components/redirect/redirect.component';

export const routes: Routes = [
    { path: 'sessions-flow', component: SessionsFlow },
    { path: 'advanced-flow', component: AdvancedFlow },
    { path: 'redirect', component: RedirectPage },
    { path: '', pathMatch: 'full', redirectTo: '/sessions-flow' },
    { path: '**', redirectTo: '/sessions-flow' }
];
