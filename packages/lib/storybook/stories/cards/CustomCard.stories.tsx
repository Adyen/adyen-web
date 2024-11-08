import { CustomCardStoryConfiguration, MetaConfiguration } from '../types';
import { CustomCardConfiguration } from '../../../src/components/CustomCard/types';
import { styles, setFocus, onBrand, onConfigSuccess, onBinLookup, onChange, setCCErrors } from './customCardHelpers/customCard.config';
import { CustomCardSeparateExpiryDate } from './customCardHelpers/CustomCardSeparateExpiryDate';
import { CustomCardDefault } from './customCardHelpers/CustomCardDefault';

type customCardStory = CustomCardStoryConfiguration<CustomCardConfiguration>;

const meta: MetaConfiguration<CustomCardConfiguration> = {
    title: 'Cards/Custom Card'
};

export const Default: customCardStory = {
    render: args => <CustomCardDefault contextArgs={args} />,
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
        force3DS2Redirect: false
    }
};

export const Variant: customCardStory = {
    render: args => <CustomCardSeparateExpiryDate contextArgs={args} />,
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
        force3DS2Redirect: false
    }
};

export default meta;
