import { MetaConfiguration, StoryConfiguration } from '../types';
import { CustomCardConfiguration } from '../../../src/components/CustomCard/types';
import './customCardHelpers/customCard.style.scss';
import { styles, setFocus, onBrand, onConfigSuccess, onBinLookup, onChange, setCCErrors } from './customCardHelpers/customCard.config';
import { CustomCardHelper } from './customCardHelpers/CustomCardHelper';

type customCardStory = StoryConfiguration<CustomCardConfiguration>;

const meta: MetaConfiguration<CustomCardConfiguration> = {
    title: 'Cards/Custom Card'
};

export const Default: customCardStory = {
    render: args => {
        return <CustomCardHelper contextArgs={args} />;
    },
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
        useSessions: false,
        // @ts-ignore allow prop specific to CustomCard story
        force3DS2Redirect: false
    }
};

export default meta;
