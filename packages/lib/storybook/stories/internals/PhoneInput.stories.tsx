import { Meta, StoryObj } from '@storybook/preact';
import PhoneInput from '../../../src/components/internal/PhoneInput';

const COUNTRIES = [
    { id: '+7', name: 'Russian Federation', code: 'RU' },
    { id: '+9955', name: 'Georgia', code: 'GE' },
    { id: '+507', name: 'Panama', code: 'PA' },
    { id: '+44', name: 'United Kingdom', code: 'GB' },
    { id: '+992', name: 'Tajikistan', code: 'TJ' },
    { id: '+370', name: 'Lithuania', code: 'LT' },
    { id: '+972', name: 'Israel', code: 'IL' },
    { id: '+996', name: 'Kyrgyzstan', code: 'KG' },
    { id: '+380', name: 'Ukraine', code: 'UA' },
    { id: '+84', name: 'Viet Nam', code: 'VN' },
    { id: '+90', name: 'Turkey', code: 'TR' },
    { id: '+994', name: 'Azerbaijan', code: 'AZ' },
    { id: '+374', name: 'Armenia', code: 'AM' },
    { id: '+371', name: 'Latvia', code: 'LV' },
    { id: '+91', name: 'India', code: 'IN' },
    { id: '+66', name: 'Thailand', code: 'TH' },
    { id: '+373', name: 'Moldova', code: 'MD' },
    { id: '+1', name: 'United States', code: 'US' },
    { id: '+81', name: 'Japan', code: 'JP' },
    { id: '+998', name: 'Uzbekistan', code: 'UZ' },
    { id: '+77', name: 'Kazakhstan', code: 'KZ' },
    { id: '+375', name: 'Belarus', code: 'BY' },
    { id: '+372', name: 'Estonia', code: 'EE' },
    { id: '+40', name: 'Romania', code: 'RO' },
    { id: '+82', name: 'Korea', code: 'KR' }
];

/**
 * Formats and returns the passed items, adds flag string
 * @param item - prefix
 * @returns item with added displayable name and image
 */
export const formatPrefixName = item => {
    if (!item) {
        throw new Error('No item passed');
    }

    if (!item.code || !item.id) {
        return false;
    }

    const flag = item.code.toUpperCase().replace(/./g, char => (String.fromCodePoint ? String.fromCodePoint(char.charCodeAt(0) + 127397) : ''));
    return {
        ...item,
        name: `${flag} ${item.name} (${item.id})`,
        selectedOptionName: flag
    };
};

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
