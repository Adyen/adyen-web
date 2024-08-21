import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { CustomCardConfiguration } from '../../../src/components/CustomCard/types';
import { CustomCard } from '../../../src';
import { Container } from '../CustomCardContainer';
import './customCardAdditions/customCards.style.scss';
import { styles, setFocus, onBrand, onConfigSuccess, onBinLookup, onChange, setCCErrors } from './customCardAdditions/customCards.config';

type customCardStory = StoryConfiguration<CustomCardConfiguration>;

const meta: MetaConfiguration<CustomCardConfiguration> = {
    title: 'Cards/Custom Card'
};

const createComponent = (args: PaymentMethodStoryProps<CustomCardConfiguration>, context) => {
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
            onChange,
            onValidationError: errors => {
                errors.forEach(setCCErrors);
            }
        }
    }
};

export default meta;
