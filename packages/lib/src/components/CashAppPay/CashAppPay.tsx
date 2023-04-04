import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import { CashAppComponent } from './components/CashAppComponent';
import { CashAppService } from './services/CashAppService';
import { CashAppSdkLoader } from './services/CashAppSdkLoader';
import { CashAppPayElementData, CashAppPayElementProps, CashAppPayEventData } from './types';
import { ICashAppService } from './services/types';
import defaultProps from './defaultProps';

export class CashAppPay extends UIElement<CashAppPayElementProps> {
    public static type = 'cashapp';

    private readonly cashAppService: ICashAppService;

    protected static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.cashAppService = new CashAppService(new CashAppSdkLoader(), {
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

    public formatData(): CashAppPayElementData {
        const { grantId, onFileGrantId, cashTag, customerId } = this.state;

        return {
            paymentMethod: {
                type: CashAppPay.type,
                ...(grantId && { grantId }),
                ...(onFileGrantId && { onFileGrantId }),
                ...(cashTag && { cashTag }),
                ...(customerId && { customerId })
            }
        };
    }

    public submit(): void {
        const { onClick } = this.props;

        new Promise<void>((resolve, reject) => onClick({ resolve, reject })).then(() => {
            this.cashAppService.begin();
        });
    }

    public get isValid(): boolean {
        return true;
    }

    private handleAuthorize = (cashAppPaymentData: CashAppPayEventData): void => {
        this.setState(cashAppPaymentData);
        super.submit();
    };

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <CashAppComponent
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    showPayButton={this.props.showPayButton}
                    cashAppService={this.cashAppService}
                    onError={this.handleError}
                    onClick={this.submit}
                    onAuthorize={this.handleAuthorize}
                />
            </CoreProvider>
        );
    }
}

export default CashAppPay;
