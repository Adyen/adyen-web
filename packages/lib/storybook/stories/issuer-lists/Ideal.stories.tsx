import { MetaConfiguration, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { Container } from '../Container';
import { IssuerListContainerProps } from '../../../src/components/helpers/IssuerListContainer';
import { Ideal } from '../../../src';

type IdealStory = StoryConfiguration<IssuerListContainerProps>;

const meta: MetaConfiguration<IssuerListContainerProps> = {
    title: 'IssuerList/IDEAL'
};

const createComponent = (args, context) => {
    const { componentConfiguration } = args;
    const checkout = getStoryContextCheckout(context);
    const ideal = new Ideal({ core: checkout, ...componentConfiguration });
    return <Container element={ideal} />;
};

export const Default: IdealStory = {
    render: createComponent,
    args: {
        countryCode: 'NL'
    }
};

export const WithHighlightedIssuers: IdealStory = {
    render: createComponent,
    args: {
        ...Default.args,
        componentConfiguration: {
            highlightedIssuers: ['1121', '1154', '1153']
        }
    }
};

export default meta;
