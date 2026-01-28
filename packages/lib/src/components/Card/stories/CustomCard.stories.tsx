import { h } from 'preact';
import { CustomCardStoryConfiguration, MetaConfiguration } from '../../../../storybook/types';
import { CustomCardConfiguration } from '../../CustomCard/types';
import { styles, setFocus, onBrand, onBinLookup, onChange, setCCErrors } from './customCardHelpers/customCard.config';
import { CustomCardSeparateExpiryDate } from './customCardHelpers/CustomCardSeparateExpiryDate';
import { CustomCardDefault } from './customCardHelpers/CustomCardDefault';

type customCardStory = CustomCardStoryConfiguration<CustomCardConfiguration>;

const meta: MetaConfiguration<CustomCardConfiguration> = {
    title: 'Components/Cards/Custom Card'
};

export const Default: customCardStory = {
    render: args => <CustomCardDefault contextArgs={args} />,
    args: {
        componentConfiguration: {
            brands: ['mc', 'visa', 'amex', 'bcmc', 'maestro', 'cartebancaire', 'synchrony_plcc'],
            styles,
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
