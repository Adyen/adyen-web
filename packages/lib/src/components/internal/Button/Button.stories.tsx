import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import Button from './Button';
import Language from '../../../language';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { CopyIconButton, CopyIconButtonProps } from './CopyIconButton';
import { ButtonProps } from './types';
import { CopyButton, CopyButtonProps } from './CopyButton';
import { Resources } from '../../../core/Context/Resources';
import { resolveEnvironments } from '../../../core/Environment';
import type { CoreConfiguration } from '../../../core/types';
import { ILanguageService } from '../../../language/LanguageService';
import './Button.stories.scss';

const languageServiceStub: ILanguageService = {
    fetchTranslationsFromCdn: () => Promise.resolve({})
};

const meta: Meta<typeof Button> = {
    title: 'Internal Elements/Button',
    component: Button,
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

const i18n = new Language({ locale: 'en-US', service: languageServiceStub });
i18n['_translations'] = {
    'payButton.redirecting': 'Redirecting',
    payButton: 'Pay',
    'button.copy': 'Copy',
    'button.copied': 'Copied!',
    confirmPreauthorization: 'Confirm preauthorization',
    payAmountFormat: 'Pay %@'
};

const coreProps = {
    loadingContext: process.env.CLIENT_ENV ?? 'test',
    i18n,
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

export const AnchorTagButton: StoryObj<ButtonProps> = {
    render: args => {
        return (
            <CoreProvider {...coreProps}>
                <Button {...args} />
            </CoreProvider>
        );
    },
    parameters: {
        controls: { include: ['disabled', 'inline', 'ariaLabel', 'href', 'target', 'label', 'variant'] }
    },
    args: {
        disabled: false,
        inline: true,
        href: 'https://www.adyen.com',
        label: 'Go to Adyen',
        variant: 'primary',
        target: '_blank'
    }
};

const CustomizedButtons = ({ modifier }: { readonly modifier: 'css-variables' | 'deprecated-css-variables' }) => (
    <CoreProvider {...coreProps}>
        <div className={`button-story-customization button-story-customization--${modifier}`}>
            <Button variant="primary" label="Pay €10.00" onClick={() => console.log('Primary button clicked')} />
            <Button variant="action" label="Action" onClick={() => console.log('Action button clicked')} />
            <CopyIconButton text={'Text to be copied'} />
        </div>
    </CoreProvider>
);

export const CustomizedWithCssVariables: StoryObj<ButtonProps> = {
    render: () => <CustomizedButtons modifier="css-variables" />,
    parameters: {
        controls: { disable: true },
        docs: { description: { story: 'Customized with the Bento v2 CSS variables the button uses.' } }
    }
};

export const CustomizedWithDeprecatedCssVariables: StoryObj<ButtonProps> = {
    render: () => <CustomizedButtons modifier="deprecated-css-variables" />,
    parameters: {
        controls: { disable: true },
        docs: { description: { story: 'Customized with the deprecated pre-Bento v2 CSS variables, which still apply to the button as fallbacks.' } }
    }
};

export default meta;
