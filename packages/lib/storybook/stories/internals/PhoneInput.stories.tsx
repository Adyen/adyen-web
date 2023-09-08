import { Meta, StoryObj } from '@storybook/preact';
import PhoneInput from '../../../src/components/internal/PhoneInput';
import COUNTRIES from '../../../src/components/QiwiWallet/countries';
import { formatPrefixName } from '../../../src/components/QiwiWallet/utils';

const meta: Meta = {
    title: 'Internals/PhoneInput',
    component: PhoneInput
};

export const Default: StoryObj = {
    render: args => {
        return (
            <PhoneInput
                items={COUNTRIES.map(formatPrefixName).filter(Boolean)}
                data={{ phonePrefix: COUNTRIES[0].id }}
                onChange={item => console.log({ item })}
                phoneNumberErrorKey={'mobileNumber.invalid'}
                {...args}
            />
        );
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    }
};

export default meta;
