import { h, Fragment } from 'preact';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import Button from '../../internal/Button';

interface RoundupProps {
    status: string;
    donationAmount: string;
    originalPaymentAmount: string;
    onDonateButtonClicked: () => void;
}

export default function Roundup(props: RoundupProps) {
    const { status, donationAmount, originalPaymentAmount, onDonateButtonClicked } = props;
    const { i18n } = useCoreContext();

    return (
        <Fragment>
            <Button
                classNameModifiers={['donate']}
                onClick={onDonateButtonClicked}
                label={`${i18n.get('donateButton')} ${donationAmount}`}
                status={status}
            />
            <span className="adyen-checkout-roundup-description">
                {i18n.get('donationRoundUpDescription', { values: { donationAmount, originalPaymentAmount } })}
            </span>
        </Fragment>
    );
}
