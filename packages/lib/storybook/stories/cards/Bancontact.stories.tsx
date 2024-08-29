import { MetaConfiguration, StoryConfiguration } from '../types';
import { CardConfiguration } from '../../../src/components/Card/types';
import Bancontact from '../../../src/components/Card/Bancontact';
import { Container } from '../Container';

type BancontactStory = StoryConfiguration<CardConfiguration>;

const meta: MetaConfiguration<CardConfiguration> = {
    title: 'Cards/Bancontact'
};

export const Default: BancontactStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Container Element={Bancontact} checkoutConfig={checkoutConfig} componentConfig={componentConfiguration} />
    ),
    args: {
        componentConfiguration: {
            _disableClickToPay: true
        },
        countryCode: 'BE'
    }
};

export default meta;
