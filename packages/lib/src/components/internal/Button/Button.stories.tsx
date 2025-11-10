import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact';
import Button from './Button';
import PayButton from '../PayButton/PayButton';
import Language from '../../../language';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { CopyIconButton, CopyIconButtonProps } from './CopyIconButton';
import { PayButtonProps } from '../PayButton/PayButton';
import { ButtonProps } from './types';
import { CopyButton, CopyButtonProps } from './CopyButton';
import { Resources } from '../../../core/Context/Resources';
import { resolveEnvironments } from '../../../core/Environment';
import type { CoreConfiguration } from '../../../core/types';

const meta: Meta<ButtonProps> = {
    title: 'Internal Elements/Button',
    component: Button as any,
    argTypes: {
        status: {
            options: ['loading', 'redirect', 'other'],
            control: { type: 'radio' }
        },
        variant: {
            options: ['primary', 'secondary', 'ghost', 'action', 'link', 'iconOnly'],
            control: { type: 'radio' }
        },
        disabled: { control: 'boolean' },
        inline: { control: 'boolean' },
        icon: { control: 'text' },
        ariaLabel: { control: 'text' },
        label: { control: 'text', description: 'If label is provided, the secondary label will not be shown' }
    }
};

const coreProps = {
    loadingContext: process.env.CLIENT_ENV,
    i18n: new Language({
        locale: 'en-US',
        translations: {
            'payButton.redirecting': 'Redirecting',
            payButton: 'Pay',
            'button.copy': 'Copy',
            'button.copied': 'Copied!',
            confirmPreauthorization: 'Confirm preauthorization'
        }
    }),
    resources: new Resources(resolveEnvironments(process.env.CLIENT_ENV as CoreConfiguration['environment']).cdnImagesUrl)
};

export const Default: StoryObj<ButtonProps> = {
    render: args => {
        return (
            <CoreProvider {...coreProps}>
                <Button {...args} onClick={() => console.log('Button clicked')} />
            </CoreProvider>
        );
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    },
    args: {
        disabled: false,
        inline: false,
        label: 'Dummy label',
        variant: 'primary',
        icon: 'https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/images/components/bento_lock.svg'
    }
};

export const CopyButtonWithIonAndText: StoryObj<CopyButtonProps> = {
    render: args => {
        return (
            <CoreProvider {...coreProps}>
                <CopyButton {...args} text={'Text to be copied'} onClick={() => console.log('Copy button clicked')} />
            </CoreProvider>
        );
    },
    parameters: {
        controls: { include: ['disabled', 'inline', 'ariaLabel'] }
    },
    args: {
        disabled: false
    }
};

export const CopyIconOnlyButton: StoryObj<CopyIconButtonProps> = {
    render: args => {
        return (
            <CoreProvider {...coreProps}>
                <CopyIconButton {...args} text={'Text to be copied'} />
            </CoreProvider>
        );
    },
    parameters: {
        controls: { include: ['disabled', 'inline', 'ariaLabel'] }
    },
    args: {
        disabled: false
    }
};

export const PaymentButton: StoryObj<PayButtonProps> = {
    render: args => {
        return (
            <CoreProvider {...coreProps}>
                <PayButton {...args} onClick={() => console.log('Pay button clicked')} />
            </CoreProvider>
        );
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'showPayButton'] }
    },
    argTypes: {
        amount: { control: 'object' },
        secondaryAmount: { control: 'object' }
    },
    args: {
        amount: { value: 1000, currency: 'EUR' },
        secondaryAmount: { value: 1200, currency: 'USD' },
        disabled: false,
        inline: false,
        variant: 'primary',
        icon: 'https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/images/components/bento_lock.svg'
    }
};

export default meta;
