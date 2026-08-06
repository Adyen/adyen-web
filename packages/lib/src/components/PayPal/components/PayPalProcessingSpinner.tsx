import { h } from 'preact';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import Spinner from '../../internal/Spinner';

export const PayPalProcessingSpinner = ({ withoutReviewPage }: Readonly<{ withoutReviewPage: boolean }>) => {
    const { i18n } = useCoreContext();

    return (
        <div className="adyen-checkout__paypal">
            <div className="adyen-checkout__paypal__status adyen-checkout__paypal__status--processing">
                <Spinner size="medium" inline />
                {withoutReviewPage && i18n.get('paypal.processingPayment')}
            </div>
        </div>
    );
};
