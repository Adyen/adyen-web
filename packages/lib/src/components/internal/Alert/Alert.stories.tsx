import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import Alert from './Alert';
import Language from '../../../language';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { Resources } from '../../../core/Context/Resources';
import { ILanguageService } from '../../../language/LanguageService';
import './Alert.stories.scss';

const languageServiceStub: ILanguageService = {
    fetchTranslationsFromCdn: () => Promise.resolve({})
};

const meta: Meta = {
    title: 'Internal Elements/Alert',
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
                        service: languageServiceStub
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

const CustomizedAlerts = ({ modifier }: { readonly modifier: 'css-variables' | 'deprecated-css-variables' }) => (
    <CoreProvider
        loadingContext={'test'}
        i18n={new Language({ locale: 'en-US', service: languageServiceStub })}
        resources={new Resources('https://checkoutshopper-test.cdn.adyen.com/checkoutshopper/')}
    >
        <div className={`alert-story-customization alert-story-customization--${modifier}`}>
            <Alert type="error" icon="cross">
                Error alert message
            </Alert>
            <Alert type="warning" icon="info">
                Warning alert message
            </Alert>
            <Alert type="info" icon="info">
                Info alert message
            </Alert>
            <Alert type="success" icon="success">
                Success alert message
            </Alert>
        </div>
    </CoreProvider>
);

export const CustomizedWithCssVariables: StoryObj = {
    render: () => <CustomizedAlerts modifier="css-variables" />,
    parameters: {
        controls: { disable: true },
        docs: { description: { story: 'Customized with the Bento v2 CSS variables the alert uses.' } }
    }
};

export const CustomizedWithDeprecatedCssVariables: StoryObj = {
    render: () => <CustomizedAlerts modifier="deprecated-css-variables" />,
    parameters: {
        controls: { disable: true },
        docs: { description: { story: 'Customized with the deprecated pre-Bento v2 CSS variables, which still apply to the alert as fallbacks.' } }
    }
};

export default meta;
