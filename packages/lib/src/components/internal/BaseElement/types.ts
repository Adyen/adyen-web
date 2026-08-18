import { Order, PaymentData } from '../../../types/global-types';
import { SRPanel } from '../../../core/Errors/SRPanel';
import { Resources } from '../../../core/Context/Resources';
import RiskElement from '../../../core/RiskModule';
import { ComponentChild } from 'preact';
import type { IAnalytics } from '../../../core/Analytics/Analytics';
import type { OnChangeData } from '../../../types';

export interface BaseElementProps {
    order?: Order;
    modules?: {
        srPanel?: SRPanel;
        analytics?: IAnalytics;
        resources?: Resources;
        risk?: RiskElement;
    };
    /**
     * Identifies if the Element is the DropIn element
     */
    isDropin?: boolean;
}

export type BaseElementState = { order?: Order } & Pick<OnChangeData, 'valid' | 'errors'> & Record<string, unknown>;

export interface IBaseElement<P extends BaseElementProps = BaseElementProps, S extends BaseElementState = BaseElementState> {
    data: Partial<PaymentData>;
    state: S;
    props: P;
    _id: string;
    _component: ComponentChild;
    render(): ComponentChild | Error;
    mount(domNode: HTMLElement | string): IBaseElement;
    update(props: Partial<P>): IBaseElement;
    unmount(): IBaseElement;
    remove(): void;
    activate(): void;
}
