import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import { CashAppComponent } from './components/CashAppComponent';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { ERRORS } from '../PayPal/constants';
import { CashAppService, ICashAppService } from './services/CashAppService';
import { CashAppSdkLoader } from './services/CashAppSdkLoader';
import { CashAppPayElementProps } from './types';

export class CashAppPay extends UIElement<CashAppPayElementProps> {
    public static type = 'cashapp';

    private readonly cashAppService: ICashAppService;

    constructor(props) {
        super(props);

        this.cashAppService = new CashAppService(new CashAppSdkLoader(), {
            environment: this.props.environment,
            amount: this.props.amount,
            clientId: this.props.configuration?.clientId || 'CAS-CI_ADYEN',
            scopeId: this.props.configuration?.scopeId || 'BRAND_0yzb9bio4n9cvqavihftllbrv',
            button: this.props.button,
            referenceId: this.props.referenceId
        });
    }

    public formatData() {
        return {
            paymentMethod: {
                type: CashAppPay.type,
                ...this.state
            }
        };
    }

    public submit() {
        this.handleError(new AdyenCheckoutError('IMPLEMENTATION_ERROR', ERRORS.SUBMIT_NOT_SUPPORTED));
    }

    public get isValid() {
        return true;
    }

    private handleSubmit = (grantId: string) => {
        this.setState({ grantId });
        super.submit();
    };

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <CashAppComponent cashAppService={this.cashAppService} onError={this.handleError} onSubmit={this.handleSubmit} />
            </CoreProvider>
        );
    }
}

export default CashAppPay;
