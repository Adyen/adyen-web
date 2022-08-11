import { Fragment, h } from 'preact';
import Button from '../../../../../../internal/Button';
import useClickToPayContext from '../../../context/useClickToPayContext';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';

type CtPEmptyCardsListProps = {
    onShowCardButtonClick(): void;
};

const CtPEmptyCardsList = ({ onShowCardButtonClick }: CtPEmptyCardsListProps) => {
    const { i18n } = useCoreContext();
    const { isCtpPrimaryPaymentMethod } = useClickToPayContext();

    return (
        <Fragment>
            <div className="adyen-checkout-ctp__section-title">{i18n.get('ctp.emptyCardsView.title')}</div>
            <div className="adyen-checkout-ctp__section-subtitle">{i18n.get('ctp.emptyCardsView.subtitle')}</div>
            <Button
                label={i18n.get('ctp.emptyCardsView.button')}
                variant={isCtpPrimaryPaymentMethod ? 'primary' : 'secondary'}
                onClick={onShowCardButtonClick}
            />
        </Fragment>
    );
};

export default CtPEmptyCardsList;
