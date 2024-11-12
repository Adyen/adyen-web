import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import CampaignContainer from './CampaignContainer';
import Button from '../../internal/Button';
import Img from '../../internal/Img';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import '../Donation.scss';
import DisclaimerMessage from '../../internal/DisclaimerMessage';
import { DonationAmount, DonationComponentProps, Status } from './types';
import useImage from '../../../core/Context/useImage';
import FixedAmounts from './FixedAmounts';
import Roundup from './Roundup';
import { getAmountLabel, getRoundupAmount, getRoundupAmountLabel } from './utils';

export default function DonationComponent(props: DonationComponentProps) {
    const { donation, commercialTxAmount, onCancel, onDonate, showCancelButton = true, termsAndConditionsUrl } = props;
    const { i18n } = useCoreContext();
    const getImage = useImage();
    const { currency, type } = donation;
    const isRoundupDonation = type === 'roundup';
    const [status, setStatus] = useState<Status>('ready');
    const [isValid, setIsValid] = useState<boolean>(isRoundupDonation);
    const [amount, setAmount] = useState<DonationAmount>({
        currency,
        value: isRoundupDonation ? getRoundupAmount(donation.maxRoundupAmount, commercialTxAmount) : null
    });

    this.setStatus = (status: Status) => {
        setStatus(status);
    };

    const handleAmountSelected = ({ target }) => {
        const value = parseInt(target.value, 10);
        setIsValid(true);
        setAmount((amount: DonationAmount) => ({ ...amount, value }));
    };

    const handleDonate = () => {
        setStatus('loading');
        onDonate({ data: { amount } });
    };

    const handleDecline = () => {
        setStatus('ready');
        onCancel({ data: { amount }, isValid });
    };

    useEffect(() => {
        props.onChange({ data: { amount }, isValid });
    }, [amount, isValid]);

    if (status === 'error') {
        return (
            <div className="adyen-checkout__adyen-giving">
                <Img
                    className="adyen-checkout__status__icon adyen-checkout__status__icon--error"
                    src={getImage({ imageFolder: 'components/' })('error')}
                    alt={i18n.get('error.message.unknown')}
                />
                <div className="adyen-checkout__status__text">{i18n.get('error.message.unknown')}</div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="adyen-checkout__adyen-giving">
                <Img
                    className="adyen-checkout__status__icon adyen-checkout__status__icon--success"
                    src={getImage({ imageFolder: 'components/' })('heart')}
                    alt={i18n.get('thanksForYourSupport')}
                />

                <div className="adyen-checkout__status__text">{i18n.get('thanksForYourSupport')}</div>
            </div>
        );
    }

    return (
        <div className="adyen-checkout__adyen-giving">
            <CampaignContainer {...props} />

            <div className="adyen-checkout__adyen-giving-actions">
                {termsAndConditionsUrl && <DisclaimerMessage message={i18n.get('donationTermsCondition')} urls={[termsAndConditionsUrl]} />}
                {isRoundupDonation ? (
                    <Roundup
                        donationAmount={getRoundupAmountLabel(i18n, { maxRoundupAmount: donation.maxRoundupAmount, commercialTxAmount, currency })}
                        originalPaymentAmount={getAmountLabel(i18n, { value: commercialTxAmount, currency })}
                        status={status}
                        onDonateButtonClicked={handleDonate}
                    ></Roundup>
                ) : (
                    <FixedAmounts
                        selectedAmount={amount.value}
                        values={donation.values}
                        currency={currency}
                        status={status}
                        onAmountSelected={handleAmountSelected}
                        onDonateButtonClicked={handleDonate}
                    ></FixedAmounts>
                )}
                {showCancelButton && (
                    <Button
                        classNameModifiers={['decline']}
                        variant="ghost"
                        onClick={handleDecline}
                        disabled={status === 'loading'}
                        label={`${i18n.get('notNowButton')} ›`}
                    />
                )}
            </div>
        </div>
    );
}

DonationComponent.defaultProps = {
    onCancel: () => {},
    onChange: () => {},
    onDonate: () => {},
    donation: {},
    showCancelButton: true
};
