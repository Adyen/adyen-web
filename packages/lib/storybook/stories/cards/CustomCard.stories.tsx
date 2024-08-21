import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { CardConfiguration } from '../../../src/components/Card/types';
import { CustomCard } from '../../../src';
import { Container } from '../CustomCardContainer';
import './customCardAdditions/customCards.style.scss';
import { styles, setFocus, onBrand, onConfigSuccess, onBinLookup, onChange, setCCErrors } from './customCardAdditions/customCards.config';

type customCardStory = StoryConfiguration<CardConfiguration>;

const meta: MetaConfiguration<CardConfiguration> = {
    title: 'Cards/Custom Card'
};

const createComponent = (args: PaymentMethodStoryProps<CardConfiguration>, context) => {
    const { componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);
    const customCard = new CustomCard(checkout, componentConfiguration);

    window['customCard'] = customCard;

    return <Container element={customCard} />;
};

export const Default: customCardStory = {
    render: createComponent,
    args: {
        componentConfiguration: {
            _disableClickToPay: true,
            styles,
            onConfigSuccess,
            onBrand,
            onBinValue: cbObj => {
                if (cbObj.encryptedBin) {
                    console.log('onBinValue', cbObj);
                }
            },
            onFocus: setFocus,
            onBinLookup,
            onChange
            // onValidationError: errors => {
            //     errors.forEach(setCCErrors);
            // }
        }
    }
};

export default meta;
