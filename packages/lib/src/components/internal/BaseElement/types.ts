import { Order } from '../../../types/global-types';
import { SRPanel } from '../../../core/Errors/SRPanel';
import { AnalyticsModule } from '../../../types/global-types';
import { Resources } from '../../../core/Context/Resources';
import RiskElement from '../../../core/RiskModule';
import { ComponentChild } from 'preact';

export interface BaseElementProps {
    order?: Order;
    modules?: {
        srPanel?: SRPanel;
        analytics?: AnalyticsModule;
        resources?: Resources;
        risk?: RiskElement;
    };
    /**
     * Identifies if the Element is the DropIn element
     */
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
    unmount(): IBaseElement;
    remove(): void;
    activate(): void;
}
