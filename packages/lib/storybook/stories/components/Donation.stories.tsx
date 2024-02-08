import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { DonationConfiguration } from '../../../src/components/Donation/types';
import Donation from '../../../src/components/Donation';
import { Container } from '../Container';

type DonationStory = StoryConfiguration<DonationConfiguration>;

const meta: MetaConfiguration<DonationConfiguration> = {
    title: 'Components/Donation'
};

const createComponent = (args: PaymentMethodStoryProps<DonationConfiguration>, context) => {
    const { componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);
    return <Container element={new Donation(checkout, componentConfiguration)} />;
};

const onDonate = (data: any, component: Donation) => {
    console.log({ data, component });
    setTimeout(() => component.setStatus('success'), 1000);
};

const onCancel = (data: any) => {
    console.log('Donation on cancel', { data });
};

export const Default: DonationStory = {
    render: createComponent,
    args: {
        componentConfiguration: {
            onDonate,
            onCancel,
            // @ts-ignore wip
            url: 'https://example.org',
            amounts: {
                currency: 'EUR',
                values: [50, 199, 300]
            },
            disclaimerMessage: {
                message: 'By donating you agree to the %{linkText} ',
                linkText: 'terms and conditions',
                link: 'https://www.adyen.com'
            },
            backgroundUrl:
                'https://www.patagonia.com/static/on/demandware.static/-/Library-Sites-PatagoniaShared/default/dwb396273f/content-banners/100-planet-hero-desktop.jpg',
            description: 'Lorem ipsum...',
            logoUrl: 'https://i.ebayimg.com/images/g/aTwAAOSwfu9dfX4u/s-l300.jpg',
            name: 'Test Charity'
        }
    }
};

export default meta;
