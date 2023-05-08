import { h } from 'preact';
import { useEffect, useMemo } from 'preact/hooks';
import ShopperCard from '../../../models/ShopperCard';
import useClickToPayContext from '../../../context/useClickToPayContext';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import useImage from '../../../../../../core/Context/useImage';
import useForm from '../../../../../../utils/useForm';
import isMobile from '../../../../../../utils/isMobile';
import renderFormField from '../../../../FormFields';
import Field from '../../../../FormFields/Field';
import './CtPCardsList.scss';

type CtPCardsListProps = {
    cards: ShopperCard[];
    cardSelected: ShopperCard;
    errorMessage?: string;
    onChangeCard(card: ShopperCard): void;
};

type CardsSelectorDataState = {
    srcDigitalCardId: string;
};

const schema = ['srcDigitalCardId'];

const CtPCardsList = ({ cardSelected, cards, errorMessage, onChangeCard }: CtPCardsListProps) => {
    const { i18n, loadingContext } = useCoreContext();
    const getImage = useImage();
    const { status } = useClickToPayContext();
    const { handleChangeFor, data } = useForm<CardsSelectorDataState>({
        schema,
        defaultData: { srcDigitalCardId: cardSelected.srcDigitalCardId }
    });

    const items = useMemo(() => {
        return cards.map(card => ({
            icon: card.artUri || getImage({ loadingContext })(card.scheme),
            name: `${isMobile() ? '' : card.title} •••• ${card.panLastFour} `,
            secondaryText: card.isExpired && i18n.get('ctp.cards.expiredCard'),
            id: card.srcDigitalCardId,
            disabled: card.isExpired
        }));
    }, [cards]);

    useEffect(() => {
        const { srcDigitalCardId } = data;
        const card = cards.find(card => card.srcDigitalCardId === srcDigitalCardId);
        onChangeCard(card);
    }, [data, onChangeCard]);

    return (
        <Field name="clickToPayCards" errorMessage={errorMessage}>
            {renderFormField('select', {
                items,
                selected: data['srcDigitalCardId'],
                name: 'cards',
                filterable: false,
                className: 'adyen-checkout-ctp__cards-list-dropdown',
                readonly: status === 'loading',
                onChange: handleChangeFor('srcDigitalCardId')
            })}
        </Field>
    );
};

export default CtPCardsList;
