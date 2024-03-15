import { Meta, StoryObj } from '@storybook/preact';
import RadioButton from '../../../src/components/internal/RadioButton';

const meta: Meta = {
    title: 'Internals/RadioButton',
    component: RadioButton,
    args: {
        isSelected: false
    }
};

export const Default: StoryObj = {
    render: args => {
        return (
            <RadioButton buttonId={'buttonId'} isSelected={false} {...args}>
                <div style={{ margin: 10 }}>Placeholder Text</div>
            </RadioButton>
        );
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    }
};

export default meta;
