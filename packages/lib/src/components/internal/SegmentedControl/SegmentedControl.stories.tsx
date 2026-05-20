import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import { SegmentedControl, SegmentedControlProps } from './SegmentedControl';
import { SegmentedControlRegion } from './SegmentedControlRegion';
import { useState } from 'preact/hooks';

const options = [
    { label: 'Master Card', value: 'mc', id: 'tab-mc', controls: 'panel-mc' },
    { label: 'Visa Card', value: 'visa', id: 'tab-visa', controls: 'panel-visa' },
    { label: 'American Express', value: 'amex', id: 'tab-amex', controls: 'panel-amex' }
];

const meta: Meta = {
    title: 'Internal Elements/SegmentedControl',
    tags: ['no-automated-visual-test'],
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
        const selectedOption = options.find(opt => opt.value === selected) || options[0];
        return (
            <div>
                <SegmentedControl {...args} selectedValue={selected} onChange={v => setSelected(v)} />
                <SegmentedControlRegion id={selectedOption.controls} ariaLabelledBy={selectedOption.id}>
                    <p>{selectedOption.label} content</p>
                </SegmentedControlRegion>
            </div>
        );
    },
    parameters: {
        controls: { exclude: ['useSessions', 'countryCode', 'shopperLocale', 'amount', 'showPayButton'] }
    }
};

export default meta;
