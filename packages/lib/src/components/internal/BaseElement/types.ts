import { Order } from '../../../types/global-types';
import { SRPanel } from '../../../core/Errors/SRPanel';
import { AnalyticsModule } from '../../../types/global-types';
import { Resources } from '../../../core/Context/Resources';
import RiskElement from '../../../core/RiskModule';
import { ComponentChild } from 'preact';

// Element / Component status
// todo: there are more, to be discovered
export enum Status {
    Ready = 'ready',
    Loading = 'loading',
    Success = 'success',
    Error = 'error',
    Redirect = 'redirect'
}

export interface State {
    status?: Status;
    isValid?: boolean;
    data?: object;
    props?: any;
    [key: string]: any; // todo: this should be updated once we check all the pms
}

export interface BaseElementProps {
    order?: Order;
    modules?: {
        srPanel?: SRPanel;
        analytics?: AnalyticsModule;
        resources?: Resources;
        risk?: RiskElement;
    };
    isDropin?: boolean;
}

export interface IBaseElement {
    data: object;
    state: State; // todo: state also contains data ...
    props: any;
    _id: string;
    _component: any;
    render(): ComponentChild | Error;
    mount(domNode: HTMLElement | string): IBaseElement;
    update(props): IBaseElement;
    unmount(): IBaseElement;
    remove(): void;
}
