import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { CustomCardConfiguration } from '../../../src/components/CustomCard/types';
import { CustomCard } from '../../../src';
import { CustomCardContainer } from '../CustomCardContainer';
import './customCardHelpers/customCard.style.scss';
import { styles, setFocus, onBrand, onConfigSuccess, onBinLookup, onChange, setCCErrors } from './customCardHelpers/customCard.config';

type customCardStory = StoryConfiguration<CustomCardConfiguration>;

const meta: MetaConfiguration<CustomCardConfiguration> = {
    title: 'Cards/Custom Card (with native 3DS2)'
};

const createComponent = (args: PaymentMethodStoryProps<CustomCardConfiguration>, context) => {
    const { componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);
    const customCard = new CustomCard(checkout, componentConfiguration);

    globalThis.customCard = customCard;
    globalThis.parent.window['customCard'] = customCard; // expose to top level window, so a user can access window.customCard

    return <CustomCardContainer element={customCard} contextArgs={args} />;
};

export const Default: customCardStory = {
    render: createComponent,
    args: {
        componentConfiguration: {
            brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro', 'cartebancaire', 'synchrony_plcc'],
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
