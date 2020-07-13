import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import CampaignContainer from './CampaignContainer';
import ButtonGroup from '../../internal/ButtonGroup';
import Button from '../../internal/Button';
import Img from '../../internal/Img';
import { getImageUrl } from '../../../utils/get-image';
import useCoreContext from '../../../core/Context/useCoreContext';
import '../Donation.scss';

export default function DonationComponent(props) {
    const { amounts, onCancel, onDonate, showCancelButton = true } = props;
    const { i18n, loadingContext } = useCoreContext();
    const { currency } = amounts;
    const [status, setStatus] = useState('ready');
    const [isValid, setIsValid] = useState(false);
    const [amount, setAmount] = useState({
        currency,
        value: null
    });

    this.setStatus = status => {
        setStatus(status);
    };

    const getAmount = (value, currency) => i18n.amount(value, currency, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    const handleAmountSelected = ({ target }) => {
        const value = parseInt(target.value, 10);
        setIsValid(true);
        setAmount(amount => ({ ...amount, value }));
    };

    const handleDonate = () => {
        setStatus('loading');
        onDonate({ data: { amount } });
    };

    const handleDecline = () => {
        setStatus('loading');
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
                    src={getImageUrl({ loadingContext, imageFolder: 'components/' })('error')}
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
                    src={getImageUrl({ loadingContext, imageFolder: 'components/' })('heart')}
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
                <div className="adyen-checkout__amounts">
                    <ButtonGroup
                        options={amounts.values.map(value => ({
                            value,
                            label: getAmount(value, currency),
                            disabled: status === 'loading',
                            selected: value === amount.value
                        }))}
                        name="amount"
                        onChange={handleAmountSelected}
                    />
                </div>

                <Button
                    classNameModifiers={['donate']}
                    onClick={handleDonate}
                    label={i18n.get('donateButton')}
                    disabled={!amount.value}
                    status={status}
                />

                {showCancelButton && (
                    <Button
                        classNameModifiers={['ghost', 'decline']}
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
    amounts: {},
    showCancelButton: true
};
