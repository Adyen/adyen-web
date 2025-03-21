import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../types';
import { ComponentContainer } from '../../ComponentContainer';
import { Checkout } from '../../Checkout';
import PayByBankPix from '../../../../src/components/PayByBankPix';
import { PayByBankPixConfiguration } from '../../../../src/components/PayByBankPix/types';
import SimulatedIssuer from './SimulatedIssuer';
import { SimulatedHostedPage } from './SimulatedHostedPage';
import { getSearchParameter } from '../../../utils/get-query-parameters';

type PixBiometricStory = StoryConfiguration<PayByBankPixConfiguration>;

const meta: MetaConfiguration<PayByBankPixConfiguration> = {
    title: 'Components/PayByBankPix'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<PayByBankPixConfiguration>) => (
    <>
        <h1>Merchant page</h1>
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new PayByBankPix(checkout, componentConfiguration)} />}
        </Checkout>
    </>
);

export const MerchantPage: PixBiometricStory = {
    render,
    args: {
        useSessions: false,
        countryCode: 'BR',
        amount: 0,
        componentConfiguration: { _isAdyenHosted: false }
    }
};

export const SimulateHostedPage: PixBiometricStory = {
    render: props => <SimulatedHostedPage {...props} />,
    args: {
        useSessions: false,
        countryCode: 'BR',
        amount: 0,
        sessionData: {
            recurringProcessingModel: 'CardOnFile',
            shopperInteraction: 'ContAuth',
            shopperName: {
                firstName: 'Leonardo',
                lastName: 'Silva'
            }
        },
        redirectResult: getSearchParameter('redirectResult'),
        _environmentUrls: { api: 'http://192.168.16.128:8080/' },
        componentConfiguration: {
            _isAdyenHosted: true,
            onChange: data => {
                console.log({ data });
            }
        }
    }
};

export const SimulateIssuerPage: PixBiometricStory = {
    render: () => <SimulatedIssuer />
};

export default meta;
