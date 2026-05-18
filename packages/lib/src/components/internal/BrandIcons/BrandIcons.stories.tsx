import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import { BrandIcons } from './BrandIcons';

import type { BrandIconsProp } from './BrandIcons';
import type { BrandIcon } from './types';

const sampleBrands: BrandIcon[] = [
    { src: 'https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/images/logos/visa.svg', alt: 'visa' },
    { src: 'https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/images/logos/mc.svg', alt: 'mc' },
    { src: 'https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/images/logos/amex.svg', alt: 'amex' },
    { src: 'https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/images/logos/discover.svg', alt: 'discover' },
    { src: 'https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/images/logos/maestro.svg', alt: 'maestro' }
];

const meta: Meta<BrandIconsProp> = {
    title: 'Internal Elements/BrandIcons',
    tags: ['no-automated-visual-test'],
    component: BrandIcons
};

export const Default: StoryObj<BrandIconsProp> = {
    render: args => {
        return <BrandIcons {...args} />;
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    },
    args: {
        brandIcons: sampleBrands
    }
};

export const WithMaxBrands: StoryObj<BrandIconsProp> = {
    render: args => {
        return <BrandIcons {...args} />;
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    },
    args: {
        brandIcons: sampleBrands,
        maxBrandsToShow: 3
    }
};

export const WithCustomRemainingLabel: StoryObj<BrandIconsProp> = {
    render: args => {
        return <BrandIcons {...args} />;
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    },
    args: {
        brandIcons: sampleBrands,
        maxBrandsToShow: 2,
        remainingBrandsLabel: '& more'
    }
};

export const SingleBrand: StoryObj<BrandIconsProp> = {
    render: args => {
        return <BrandIcons {...args} />;
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    },
    args: {
        brandIcons: [sampleBrands[0]]
    }
};

export const WithCustomRenderBrandIcon: StoryObj<BrandIconsProp> = {
    render: args => {
        return <BrandIcons {...args} />;
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    },
    args: {
        brandIcons: sampleBrands.slice(0, 3),
        renderBrandIcon: (brandIcon: BrandIcon) => (
            <span key={brandIcon.alt} style={{ border: '1px solid #ccc', padding: '4px', borderRadius: '4px' }}>
                <img src={brandIcon.src} alt={brandIcon.alt} style={{ margin: 0, padding: 0 }} />
            </span>
        )
    }
};

export const PaymentMethodBrands: StoryObj<BrandIconsProp> = {
    render: args => {
        return <BrandIcons {...args} />;
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    },
    args: {
        brandIcons: sampleBrands,
        maxBrandsToShow: 3,
        showIconOnError: true
    }
};

export default meta;
