import { Fragment, h } from 'preact';
import Button from '../../../../../../internal/Button';
import useClickToPayContext from '../../../context/useClickToPayContext';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import './CtPEmptyCards.scss';
import CtPSection from '../../CtPSection';

const CtPEmptyCardsList = () => {
    const { i18n } = useCoreContext();
    const { isCtpPrimaryPaymentMethod } = useClickToPayContext();

    return (
        <Fragment>
            <CtPSection.Title>{i18n.get('ctp.cards.title')}</CtPSection.Title>
            <CtPSection.Subtitle>{i18n.get('ctp.cards.subtitle')}</CtPSection.Subtitle>

            <div className="adyen-checkout-ctp__empty-cards">{i18n.get('ctp.emptyProfile.message')}</div>

            <Button disabled label={i18n.get('payButton')} variant={isCtpPrimaryPaymentMethod ? 'primary' : 'secondary'} />
        </Fragment>
    );
};

export default CtPEmptyCardsList;
