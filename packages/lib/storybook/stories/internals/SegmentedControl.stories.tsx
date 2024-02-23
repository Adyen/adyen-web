import { Meta, StoryObj } from '@storybook/preact';
import SegmentedControl from '../../../src/components/internal/SegmentedControl';
import { SegmentedControlProps } from '../../../src/components/internal/SegmentedControl/SegmentedControl';
import { useState } from 'preact/hooks';

const options = [
    { label: 'Master Card', value: 'mc' },
    { label: 'Visa Card', value: 'visa' },
    { label: 'American Express', value: 'amex' }
];

const meta: Meta = {
    title: 'Internals/SegmentedControl',
    component: SegmentedControl,
    argTypes: {
        selectedValue: {
            options: options.map(opt => opt.value),
            control: { type: 'radio' }
        }
    },
    args: {
        options,
        selectedValue: 'mc',
        disabled: false
    }
};

export const Default: StoryObj<SegmentedControlProps<string>> = {
    render: args => {
        const [selected, setSelected] = useState<string>(args.selectedValue);
        return <SegmentedControl {...args} selectedValue={selected} onChange={v => setSelected(v)} />;
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    }
};

export default meta;
