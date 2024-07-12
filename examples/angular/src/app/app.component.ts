import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SessionsFlow } from '../components/sessions-flow/sessions.component';
import { ModeSwitcher } from '../components/mode-switcher/mode-switcher';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [SessionsFlow, RouterOutlet, ModeSwitcher],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {}
