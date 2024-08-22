import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { CustomCardConfiguration } from '../../../src/components/CustomCard/types';
import { CustomCard } from '../../../src';
import { CustomCardContainer } from '../CustomCardContainer';
import './customCardHelpers/customCard.style.scss';
import { styles, setFocus, onBrand, onConfigSuccess, onBinLookup, onChange, setCCErrors } from './customCardHelpers/customCard.config';

type customCardStory = StoryConfiguration<CustomCardConfiguration>;

const meta: MetaConfiguration<CustomCardConfiguration> = {
    title: 'Cards/Custom Card'
};

const createComponent = (args: PaymentMethodStoryProps<CustomCardConfiguration>, context) => {
    const { componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);
    const customCard = new CustomCard(checkout, componentConfiguration);

    window['customCard'] = customCard;

    return <CustomCardContainer element={customCard} context={context} />;
};

export const Default: customCardStory = {
    render: createComponent,
    args: {
        componentConfiguration: {
            styles,
            onConfigSuccess,
            onBrand,
            // onBinValue: cbObj => {
            //     if (cbObj.encryptedBin) {
            //         console.log('onBinValue', cbObj);
            //     }
            // },
            onFocus: setFocus,
            onBinLookup,
            onChange,
            onValidationError: errors => {
                errors.forEach(setCCErrors);
            }
        },
        useSessions: false
    }
};

export default meta;
