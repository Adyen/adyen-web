import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import { CashAppPayButton } from './components/CashAppPayButton';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { ERRORS } from '../PayPal/constants';
import { CashAppService, ICashAppService } from './services/CashAppService';
import { CashAppSdkLoader } from './services/CashAppSdkLoader';
import { UIElementProps } from '../types';

interface CashAppPayElementProps extends UIElementProps {
    referenceId?: string;

    button?: {
        shape?: 'semiround' | 'round';
        size?: 'medium' | 'small';
        theme?: 'dark' | 'light';
        width?: 'static' | 'full';
    };

    configuration: {
        clientId: string;
        scopeId: string;
    };
}

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

        console.log(this.cashAppService);
    }

    submit() {
        this.handleError(new AdyenCheckoutError('IMPLEMENTATION_ERROR', ERRORS.SUBMIT_NOT_SUPPORTED));
    }

    // get isValid() {
    //     return !!this.state.isValid;
    // }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <CashAppPayButton cashAppService={this.cashAppService} />
            </CoreProvider>
        );
    }
}

export default CashAppPay;
