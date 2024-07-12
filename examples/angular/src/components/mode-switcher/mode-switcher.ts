import { NgClass, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
    selector: 'mode-switcher',
    templateUrl: './mode-switcher.html',
    styleUrl: './mode-switcher.css',
    imports: [NgClass],
    standalone: true
})
export class ModeSwitcher implements OnInit {
    isAdvancedFlowPageActive = false;

    constructor(private router: Router) {}

    ngOnInit() {
        this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
            // @ts-ignore
            this.isAdvancedFlowPageActive = event.url === '/advanced-flow';
        });
    }

    onAdvancedFlowClick() {
        this.router.navigate(['advanced-flow']);
    }

    onSessionsFlowClick() {
        this.router.navigate(['sessions-flow']);
    }
}
