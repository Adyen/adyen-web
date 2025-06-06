import { Meta, StoryObj } from '@storybook/preact';
import Button from '../../../src/components/internal/Button';
import Language from '../../../src/language';
import { CoreProvider } from '../../../src/core/Context/CoreProvider';
import CopyIconButton from '../../../src/components/internal/Button/CopyIconButton';

//    status?: string;
//     /**
//      * Class name modifiers will be used as: `adyen-checkout__button--${modifier}`
//      */
//     classNameModifiers?: string[];
//     variant?: ButtonVariant;
//     disabled?: boolean;
//     label?: string | h.JSX.Element;
//     ariaLabel?: string;
//     secondaryLabel?: string;
//     icon?: string;
//     inline?: boolean;
//     href?: string;
//     target?: string;
//     rel?: string;
//     onClick?: (e, callbacks) => void;
//     onKeyDown?: (event: KeyboardEvent) => void;

const meta: Meta = {
    title: 'Internals/Button',
    // @ts-ignore todo:fix
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
        ariaLabel: { control: 'text' }
    }
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
                            'button.copy': 'Copy'
                        }
                    })
                }
                resources={global.resources}
            >
                <CopyIconButton {...args} onClick={() => console.log('Copy icon only button clicked')} />
            </CoreProvider>
        );
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    },
    args: {
        disabled: false
    }
};

export default meta;
