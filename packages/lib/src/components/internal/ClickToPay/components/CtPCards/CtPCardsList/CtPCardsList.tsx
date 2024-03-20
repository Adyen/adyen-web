import { h } from 'preact';
import { useEffect, useMemo } from 'preact/hooks';
import ShopperCard from '../../../models/ShopperCard';
import useClickToPayContext from '../../../context/useClickToPayContext';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import useImage from '../../../../../../core/Context/useImage';
import useForm from '../../../../../../utils/useForm';
import isMobile from '../../../../../../utils/isMobile';
import Field from '../../../../FormFields/Field';
import './CtPCardsList.scss';
import Select from '../../../../FormFields/Select';
import { Status } from '../../../../BaseElement/types';

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
    const { i18n } = useCoreContext();
    const getImage = useImage();
    const { status } = useClickToPayContext();
    const { handleChangeFor, data } = useForm<CardsSelectorDataState>({
        schema,
        defaultData: { srcDigitalCardId: cardSelected.srcDigitalCardId }
    });

    const items = useMemo(() => {
        return cards.map(card => ({
            icon: card.artUri || getImage()(card.scheme),
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
        <Field name="clickToPayCards" errorMessage={errorMessage} readOnly={status === Status.Loading}>
            <Select
                items={items}
                selectedValue={data['srcDigitalCardId']}
                name={'cards'}
                filterable={false}
                className={'adyen-checkout-ctp__cards-list-dropdown'}
                readonly={status === Status.Loading}
                onChange={handleChangeFor('srcDigitalCardId')}
            />
        </Field>
    );
};

export default CtPCardsList;
