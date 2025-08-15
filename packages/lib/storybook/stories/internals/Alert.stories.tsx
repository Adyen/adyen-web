import { Meta, StoryObj } from '@storybook/preact';
import Alert from '../../../src/components/internal/Alert';
import Language from '../../../src/language';
import { CoreProvider } from '../../../src/core/Context/CoreProvider';
import { Resources } from '../../../src/core/Context/Resources';

const meta: Meta = {
    title: 'Internals/Alert',
    component: Alert,
    argTypes: {
        type: {
            options: ['error', 'warning', 'info', 'success'],
            control: { type: 'radio' }
        },
        icon: {
            options: ['cross', 'info', 'info', 'success'],
            control: { type: 'radio' }
        }
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
                        translations: {}
                    })
                }
                resources={new Resources('https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/')}
            >
                <Alert {...args}>dummy alert message</Alert>
            </CoreProvider>
        );
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    },
    args: {
        type: 'error',
        icon: 'cross'
    }
};
export default meta;
