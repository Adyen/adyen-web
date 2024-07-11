import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SessionsFlow } from '../components/sessions-flow/sessions.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [SessionsFlow, RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {}
