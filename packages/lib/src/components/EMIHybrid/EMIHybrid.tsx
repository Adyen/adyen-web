import { h } from 'preact';

import { HybridUIElement } from '../internal/HybridUIElement';
import { CardElement } from '../Card/Card';
import UPIElement from '../UPI';
import { TxVariants } from '../tx-variants';
import collectBrowserInfo from '../../utils/browserInfo';
import { EMIHybridComponent } from './EMIHybridComponent';

import type { EMIHybridConfiguration, EMIHybridPaymentData, EMIHybridFundingSource } from './types';
import { EMIHybridFundingSource as FundingSource } from './types';
import type { ICore } from '../../core/types';

export class EMIHybridElement extends HybridUIElement<EMIHybridConfiguration> {
    public static readonly type = TxVariants.emi_hybrid;
    
    protected static defaultProps: Partial<EMIHybridConfiguration> = {
        showPayButton: true,
    };

    public activeFundingSource: EMIHybridFundingSource;

    constructor(checkout: ICore, props?: EMIHybridConfiguration) {
        super(checkout, props);
        
        this.activeFundingSource = FundingSource.CARD;
        
        this.initializeFundingSources();
        this.setCardSlotRef = this.setCardSlotRef.bind(this);
        this.setUpiSlotRef = this.setUpiSlotRef.bind(this);
        this.handleFundingSourceChange = this.handleFundingSourceChange.bind(this);
    }
    
    private initializeFundingSources(): void {
        this.registerFundingSource(FundingSource.CARD, {
            Component: CardElement,
            props: {
                ...this.props.fundingSourceConfiguration?.card,
                _disableClickToPay: true,
                showStoreDetailsCheckbox: false,
                enableStoreDetails: false,
            },
        });

        this.registerFundingSource(FundingSource.UPI, {
            Component: UPIElement,
            props: {
                ...this.props.fundingSourceConfiguration?.upi,
                defaultMode: 'qrCode',
            },
        });
        
        this.setActiveFundingSource(FundingSource.CARD);
    }

    private setCardSlotRef(ref: HTMLElement | null): void {
        if (ref) {
            this.mountFundingSourceInSlot(FundingSource.CARD, ref);
        }
    }

    private setUpiSlotRef(ref: HTMLElement | null): void {
        if (ref) {
            this.mountFundingSourceInSlot(FundingSource.UPI, ref);
        }
    }

    private handleFundingSourceChange(fundingSource: EMIHybridFundingSource): void {
        this.activeFundingSource = fundingSource;
        this.setActiveFundingSource(fundingSource);
    }

    get card(): CardElement {
        return this.getFundingSource(FundingSource.CARD) as CardElement;
    }

    get upi(): UPIElement {
        return this.getFundingSource(FundingSource.UPI) as UPIElement;
    }
    
    formatData(): EMIHybridPaymentData {
        const activeFundingSourceData = this.getActiveFundingSourceData();
        const fundingSourcePaymentMethod = activeFundingSourceData?.paymentMethod;
        
        const payload: EMIHybridPaymentData = {
            paymentMethod: {
                type: TxVariants.emi_hybrid,
                fundingSource: fundingSourcePaymentMethod,
            },
            origin: typeof window !== 'undefined' ? window.location.origin : '',
        };
        
        if (this.activeFundingSourceKey === FundingSource.CARD) {
            payload.browserInfo = collectBrowserInfo();
            
            if (activeFundingSourceData?.billingAddress) {
                payload.billingAddress = activeFundingSourceData.billingAddress;
            }
        }
        
        return payload;
    }
    
    get isValid(): boolean {
        return this.isActiveFundingSourceValid();
    }

    public override submit(): void {
        const activeFundingSource = this.getActiveFundingSource();

        if (!this.isValid) {
            activeFundingSource?.showValidation();
            return;
        }

        super.submit();
    }
    
    protected componentToRender(): h.JSX.Element {
        return (
            <EMIHybridComponent
                defaultActiveFundingSource={this.activeFundingSource}
                onSetActiveFundingSource={this.handleFundingSourceChange}
                showPayButton={this.props.showPayButton}
                payButton={this.payButton.bind(this)}
                cardSlotRef={this.setCardSlotRef}
                upiSlotRef={this.setUpiSlotRef}
            />
        );
    }
}

export default EMIHybridElement;
