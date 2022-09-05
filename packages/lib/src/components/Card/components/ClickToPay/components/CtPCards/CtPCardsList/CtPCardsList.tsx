import { h } from 'preact';
import Field from '../../../../../../internal/FormFields/Field';
import renderFormField from '../../../../../../internal/FormFields';
import { useEffect, useMemo } from 'preact/hooks';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import useForm from '../../../../../../../utils/useForm';
import ShopperCard from '../../../models/ShopperCard';
import useClickToPayContext from '../../../context/useClickToPayContext';
import getImage from '../../../../../../../utils/get-image';

type CtPCardsListProps = {
    cards: ShopperCard[];
    onChangeCard(card: ShopperCard): void;
};

type CardsSelectorDataState = {
    srcDigitalCardId: string;
};

const schema = ['srcDigitalCardId'];

const CtPCardsList = ({ cards, onChangeCard }: CtPCardsListProps) => {
    const { i18n, loadingContext } = useCoreContext();
    const { status } = useClickToPayContext();
    const { handleChangeFor, data } = useForm<CardsSelectorDataState>({
        schema,
        defaultData: { srcDigitalCardId: cards[0].srcDigitalCardId }
    });

    const items = useMemo(() => {
        return cards.map(card => ({
            icon: card.artUri || getImage({ loadingContext })(card.scheme),
            name: `${card.title ? card.title : ''} •••• ${card.panLastFour}`,
            id: card.srcDigitalCardId
        }));
    }, [cards]);

    useEffect(() => {
        const { srcDigitalCardId } = data;
        const card = cards.find(card => card.srcDigitalCardId === srcDigitalCardId);
        onChangeCard(card);
    }, [data, onChangeCard]);

    return (
        <Field label={i18n.get('ctp.cards.cardSelector')} name="clickToPayCards">
            {renderFormField('select', {
                items,
                selected: data['srcDigitalCardId'],
                name: 'cards',
                filterable: false,
                isIconOnLeftSide: true,
                readonly: status === 'loading',
                onChange: handleChangeFor('srcDigitalCardId')
            })}
        </Field>
    );
};

export default CtPCardsList;
