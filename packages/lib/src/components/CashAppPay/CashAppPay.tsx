import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import { CashAppComponent } from './components/CashAppComponent';
import CashAppService from './services/CashAppService';
import { CashAppSdkLoader } from './services/CashAppSdkLoader';
import { CashAppPayElementData, CashAppPayElementProps, CashAppPayEventData } from './types';
import { ICashAppService } from './services/types';
import defaultProps from './defaultProps';
import RedirectButton from '../internal/RedirectButton';

export class CashAppPay extends UIElement<CashAppPayElementProps> {
    public static type = 'cashapp';

    private readonly cashAppService: ICashAppService;

    protected static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.cashAppService = new CashAppService(new CashAppSdkLoader(), {
            storePaymentMethod: this.props.storePaymentMethod,
            useCashAppButtonUi: this.props.showPayButton,
            environment: this.props.environment,
            amount: this.props.amount,
            redirectURL: this.props.redirectURL,
            clientId: this.props.configuration?.clientId,
            scopeId: this.props.configuration?.scopeId,
            button: this.props.button,
            referenceId: this.props.referenceId
        });
    }

    public formatProps(props: CashAppPayElementProps) {
        return {
            ...props,
            enableStoreDetails: props.session?.configuration?.enableStoreDetails || props.enableStoreDetails
        };
    }

    public formatData(): CashAppPayElementData {
        const { shopperWantsToStore, grantId, onFileGrantId, cashTag, customerId } = this.state;
        const { storePaymentMethod: storePaymentMethodSetByMerchant, storedPaymentMethodId } = this.props;

        const includeStorePaymentMethod = !this.props.session && (shopperWantsToStore || storePaymentMethodSetByMerchant);

        if (storedPaymentMethodId) {
            return {
                paymentMethod: {
                    type: CashAppPay.type,
                    storedPaymentMethodId
                }
            };
        }

        const shouldAddOnFileProps = includeStorePaymentMethod && onFileGrantId && cashTag;

        return {
            paymentMethod: {
                type: CashAppPay.type,
                ...(grantId && { grantId }),
                ...(customerId && { customerId }),
                ...(shouldAddOnFileProps && { onFileGrantId, cashtag: cashTag })
            },
            ...(includeStorePaymentMethod && { storePaymentMethod: true })
        };
    }

    public submit = () => {
        const { onClick, storedPaymentMethodId } = this.props;

        new Promise<void>((resolve, reject) => onClick({ resolve, reject }))
            .then(() => {
                if (storedPaymentMethodId) {
                    super.submit();
                    return;
                }
                return this.cashAppService.createCustomerRequest();
            })
            .then(() => {
                this.cashAppService.begin();
            });
    };

    public get isValid(): boolean {
        return true;
    }

    private handleAuthorize = (cashAppPaymentData: CashAppPayEventData): void => {
        this.setState(cashAppPaymentData);
        super.submit();
    };

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} resources={this.resources} loadingContext={this.props.loadingContext}>
                {this.props.storedPaymentMethodId ? (
                    <RedirectButton
                        name={this.displayName}
                        amount={this.props.amount}
                        payButton={this.payButton}
                        onSubmit={this.submit}
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                    />
                ) : (
                    <CashAppComponent
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        enableStoreDetails={this.props.enableStoreDetails}
                        // showPayButton={this.props.showPayButton}
                        cashAppService={this.cashAppService}
                        onChange={this.setState}
                        onError={this.handleError}
                        onClick={this.submit}
                        onAuthorize={this.handleAuthorize}
                    />
                )}
            </CoreProvider>
        );
    }
}

export default CashAppPay;
