import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Checkout } from '../components/checkout/checkout.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [Checkout],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {}
