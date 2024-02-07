import { Order } from '../../../types/global-types';
import { SRPanel } from '../../../core/Errors/SRPanel';
import Analytics from '../../../core/Analytics';
import { Resources } from '../../../core/Context/Resources';
import RiskElement from '../../../core/RiskModule';
import { ComponentChild } from 'preact';

export interface BaseElementProps {
    order?: Order;
    modules?: {
        srPanel?: SRPanel;
        analytics?: Analytics;
        resources?: Resources;
        risk?: RiskElement;
    };
    isDropin?: boolean;
}

export interface IBaseElement {
    data: object;
    state: any;
    props: any;
    _id: string;
    _component: any;
    render(): ComponentChild | Error;
    mount(domNode: HTMLElement | string): IBaseElement;
    update(props): IBaseElement;
    remount(component): IBaseElement;
    unmount(): IBaseElement;
    remove(): void;
}
