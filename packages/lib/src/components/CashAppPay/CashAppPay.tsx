import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import { CashAppComponent } from './components/CashAppComponent';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { ERRORS } from '../PayPal/constants';
import { CashAppService } from './services/CashAppService';
import { CashAppSdkLoader } from './services/CashAppSdkLoader';
import { CashAppPayElementData, CashAppPayElementProps } from './types';
import { ICashAppService } from './services/types';

export class CashAppPay extends UIElement<CashAppPayElementProps> {
    public static type = 'cashapp';

    private readonly cashAppService: ICashAppService;

    constructor(props) {
        super(props);

        this.cashAppService = new CashAppService(new CashAppSdkLoader(), {
            environment: this.props.environment,
            amount: this.props.amount,
            redirectURL: this.props.redirectURL,
            clientId: this.props.configuration?.clientId || 'CAS-CI_ADYEN',
            scopeId: this.props.configuration?.scopeId || 'BRAND_0yzb9bio4n9cvqavihftllbrv',
            button: this.props.button,
            referenceId: this.props.referenceId
        });
    }

    public formatData(): CashAppPayElementData {
        return {
            paymentMethod: {
                type: CashAppPay.type,
                grantId: this.state.grantId
            }
        };
    }

    public submit(): void {
        this.handleError(new AdyenCheckoutError('IMPLEMENTATION_ERROR', ERRORS.SUBMIT_NOT_SUPPORTED));
    }

    public get isValid(): boolean {
        return true;
    }

    private handleSubmit = (grantId: string): void => {
        this.setState({ grantId });
        super.submit();
    };

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <CashAppComponent
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    cashAppService={this.cashAppService}
                    onError={this.handleError}
                    onSubmit={this.handleSubmit}
                />
            </CoreProvider>
        );
    }
}

export default CashAppPay;
