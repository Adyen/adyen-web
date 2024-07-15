import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'mode-switcher',
    templateUrl: './mode-switcher.html',
    styleUrl: './mode-switcher.css',
    imports: [NgClass],
    standalone: true
})
export class ModeSwitcher implements OnInit {
    isAdvancedFlowPageActive = false;

    constructor(
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isAdvancedFlowPageActive = this.router.url.includes('/advanced-flow');
    }

    onAdvancedFlowClick() {
        this.router.navigate(['advanced-flow'], { queryParams: this.route.snapshot.queryParams });
    }

    onSessionsFlowClick() {
        this.router.navigate(['sessions-flow'], { queryParams: this.route.snapshot.queryParams });
    }
}
