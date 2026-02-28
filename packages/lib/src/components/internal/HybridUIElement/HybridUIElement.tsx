import { h } from 'preact';
import { render } from 'preact';

import UIElement from '../UIElement';

import type { UIElementProps } from '../UIElement/types';
import type { ICore } from '../../../core/types';

export interface FundingSourceConfig<T extends UIElementProps = UIElementProps> {
    Component: new (core: ICore, props?: T) => UIElement<T>;
    props?: Partial<T>;
}

export interface HybridUIElementProps extends UIElementProps {
    fundingSourcesConfig?: Record<string, FundingSourceConfig>;
}

interface RegisteredFundingSource {
    key: string;
    element: UIElement;
    slotRef: HTMLElement | null;
}

export abstract class HybridUIElement<P extends HybridUIElementProps = HybridUIElementProps> extends UIElement<P> {
    protected fundingSources: Map<string, RegisteredFundingSource> = new Map();
    
    protected activeFundingSourceKey: string | null = null;
    
    constructor(checkout: ICore, props?: P) {
        super(checkout, props);
    }

    protected registerFundingSource<T extends UIElementProps>(
        key: string,
        config: FundingSourceConfig<T>
    ): UIElement<T> {
        const { Component, props = {} } = config;
        
        const fundingSourceElement = new Component(this.core, {
            ...props,
            isDropin: true,
            showPayButton: false,
        } as unknown as T);
        
        this.fundingSources.set(key, {
            key,
            element: fundingSourceElement,
            slotRef: null,
        });
        
        if (this.fundingSources.size === 1) {
            this.activeFundingSourceKey = key;
        }
        
        return fundingSourceElement;
    }
    
    protected getFundingSource(key: string): UIElement | undefined {
        return this.fundingSources.get(key)?.element;
    }
    
    protected getActiveFundingSource(): UIElement | undefined {
        if (!this.activeFundingSourceKey) return undefined;
        return this.getFundingSource(this.activeFundingSourceKey);
    }

    protected mountFundingSourceInSlot(key: string, slotElement: HTMLElement): void {
        const fundingSource = this.fundingSources.get(key);
        if (!fundingSource) {
            console.warn(`HybridUIElement: FundingSource '${key}' not found`);
            return;
        }
        
        fundingSource.slotRef = slotElement;
        
        const fundingSourceComponent = fundingSource.element.render();
        
        render(fundingSourceComponent, slotElement);
    }
    
    protected unmountFundingSource(key: string): void {
        const fundingSource = this.fundingSources.get(key);
        if (!fundingSource?.slotRef) return;
        
        render(null, fundingSource.slotRef);
        fundingSource.slotRef = null;
    }
    
    protected setActiveFundingSource(key: string): void {
        if (!this.fundingSources.has(key)) {
            console.warn(`HybridUIElement: Cannot set active funding source '${key}' - not registered`);
            return;
        }
        
        this.activeFundingSourceKey = key;
        this.onChange();
    }
    
    protected getActiveFundingSourceData(): any {
        const activeFundingSource = this.getActiveFundingSource();
        if (!activeFundingSource) return {};
        
        return activeFundingSource.data;
    }
    
    protected isActiveFundingSourceValid(): boolean {
        const activeFundingSource = this.getActiveFundingSource();
        return activeFundingSource?.isValid ?? false;
    }

    public unmount(): this {
        for (const [key] of this.fundingSources) {
            this.unmountFundingSource(key);
        }
        
        return super.unmount();
    }
    
    public remove(): void {
        this.fundingSources.clear();
        this.activeFundingSourceKey = null;
        
        super.remove();
    }
}

export default HybridUIElement;
