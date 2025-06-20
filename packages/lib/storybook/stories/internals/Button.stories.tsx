import { Meta, StoryObj } from '@storybook/preact';
import Button from '../../../src/components/internal/Button';
import Language from '../../../src/language';
import { CoreProvider } from '../../../src/core/Context/CoreProvider';
import { CopyIconButton } from '../../../src/components/internal/Button/CopyIconButton';

const meta: Meta = {
    title: 'Internals/Button',
    // @ts-ignore todo:fix
    component: Button
};

export const Default: StoryObj = {
    render: args => {
        return (
            <CoreProvider
                loadingContext={'test'}
                i18n={
                    new Language({
                        locale: 'en-US',
                        translations: {
                            'payButton.redirecting': 'Redirecting'
                        }
                    })
                }
                resources={global.resources}
            >
                <Button {...args} onClick={() => console.log('Button clicked')} />
            </CoreProvider>
        );
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    },
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
        ariaLabel: { control: 'text' }
    },
    args: {
        disabled: false,
        inline: false,
        label: 'Dummy label',
        variant: 'primary',
        icon: 'https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/images/components/bento_lock.svg'
    }
};

export const CopyIconOnlyButton: StoryObj = {
    render: args => {
        return (
            <CoreProvider
                loadingContext={'test'}
                i18n={
                    new Language({
                        locale: 'en-US',
                        translations: {
                            'button.copy': 'Copy',
                            'button.copied': 'Copied!'
                        }
                    })
                }
                resources={global.resources}
            >
                <CopyIconButton {...args} text={'Text to be copied'} />
            </CoreProvider>
        );
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    },
    argTypes: {
        disabled: { control: 'boolean' },
        inline: { control: 'boolean' },
        ariaLabel: { control: 'text' }
    },
    args: {
        disabled: false
    }
};

export default meta;
