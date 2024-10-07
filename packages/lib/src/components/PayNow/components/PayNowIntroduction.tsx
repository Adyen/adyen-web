import { h } from 'preact';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import ContentSeparator from '../../internal/ContentSeparator';
import './PayNowIntroduction.scss';

const PayNowIntroduction = () => {
    const { i18n } = useCoreContext();

    return (
        <div className="adyen-checkout-paynow__introduction">
            {i18n.get('paynow.scanQrCode')}

            <div className="adyen-checkout-paynow__introduction--mobile-only" data-testid="paynow-mobile-instructions">
                <ContentSeparator />
                <ol className="c-timeline">
                    <li className="c-timeline__item">
                        <div className="c-timeline__content">
                            <p className="c-timeline__desc">Take a screenshot of the QR code.</p>
                        </div>
                    </li>
                    <li className="c-timeline__item">
                        <div className="c-timeline__content">
                            <p className="c-timeline__desc">Open the PayNow bank or payment app.</p>
                        </div>
                    </li>
                    <li className="c-timeline__item">
                        <div className="c-timeline__content">
                            <p className="c-timeline__desc">Select the option to scan a QR code.</p>
                        </div>
                    </li>
                    <li className="c-timeline__item">
                        <div className="c-timeline__content">
                            <p className="c-timeline__desc">Choose the option to upload a QR and select the screenshot.</p>
                        </div>
                    </li>
                    <li className="c-timeline__item">
                        <div className="c-timeline__content">
                            <p className="c-timeline__desc">Complete the transaction.</p>
                        </div>
                    </li>
                </ol>
            </div>
        </div>
    );
};

export { PayNowIntroduction };
