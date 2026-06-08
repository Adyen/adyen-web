import { h } from 'preact';
import { useState } from 'preact/hooks';
import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { SegmentedControl, SegmentedControlOptions } from './SegmentedControl';

const DEFAULT_OPTIONS: SegmentedControlOptions<string> = [
    {
        value: 'option 1',
        label: 'Option 1',
        id: 'option-1',
        controls: 'panel-1'
    },
    {
        value: 'option 2',
        label: 'Option 2',
        id: 'option-2',
        controls: 'panel-2'
    }
];

const getTab1 = () => screen.getByRole('tab', { name: DEFAULT_OPTIONS[0].label });
const getTab2 = () => screen.getByRole('tab', { name: DEFAULT_OPTIONS[1].label });

const Component = ({ options }: Readonly<{ options: SegmentedControlOptions<string> }>) => {
    const defaultOption = options[0].value;
    const [selectedOption, setSelectedOption] = useState<string>(defaultOption);

    return <SegmentedControl selectedValue={selectedOption} options={options} onChange={setSelectedOption} />;
};

const renderSegmentedControl = (options: SegmentedControlOptions<string>) => {
    return render(<Component options={options} />);
};

describe('SegmentedControl', () => {
    describe('ARIA roles and attributes', () => {
        test('should render a tablist container', () => {
            renderSegmentedControl(DEFAULT_OPTIONS);
            const tablist = screen.getByRole('tablist');
            expect(tablist).toBeInTheDocument();
        });

        test('should render tabs with role="tab"', () => {
            renderSegmentedControl(DEFAULT_OPTIONS);
            const tabs = screen.getAllByRole('tab');
            expect(tabs).toHaveLength(2);
        });

        test('should set id attribute on each tab', () => {
            renderSegmentedControl(DEFAULT_OPTIONS);
            expect(getTab1()).toHaveAttribute('id', 'option-1');
            expect(getTab2()).toHaveAttribute('id', 'option-2');
        });

        test('should mark selected tab with aria-selected="true"', () => {
            renderSegmentedControl(DEFAULT_OPTIONS);
            expect(getTab1()).toHaveAttribute('aria-selected', 'true');
            expect(getTab2()).toHaveAttribute('aria-selected', 'false');
        });

        test('should NOT use aria-expanded', () => {
            renderSegmentedControl(DEFAULT_OPTIONS);
            expect(getTab1()).not.toHaveAttribute('aria-expanded');
            expect(getTab2()).not.toHaveAttribute('aria-expanded');
        });

        test('should set aria-controls on each tab', () => {
            renderSegmentedControl(DEFAULT_OPTIONS);
            expect(getTab1()).toHaveAttribute('aria-controls', 'panel-1');
            expect(getTab2()).toHaveAttribute('aria-controls', 'panel-2');
        });
    });

    describe('Selection behavior', () => {
        test('should switch aria-selected on click', async () => {
            const user = userEvent.setup();
            renderSegmentedControl(DEFAULT_OPTIONS);

            expect(getTab1()).toHaveAttribute('aria-selected', 'true');
            expect(getTab2()).toHaveAttribute('aria-selected', 'false');

            await user.click(getTab2());

            await waitFor(() => {
                expect(getTab2()).toHaveAttribute('aria-selected', 'true');
            });
            expect(getTab1()).toHaveAttribute('aria-selected', 'false');

            await user.click(getTab1());

            await waitFor(() => {
                expect(getTab1()).toHaveAttribute('aria-selected', 'true');
            });
            expect(getTab2()).toHaveAttribute('aria-selected', 'false');
        });
    });

    describe('Edge cases', () => {
        test('should not render when options are empty', () => {
            const { container } = render(<SegmentedControl selectedValue="x" options={[]} onChange={jest.fn()} />);
            expect(container).toBeEmptyDOMElement();
        });

        test('should not render when options are undefined', () => {
            const { container } = render(<SegmentedControl selectedValue="x" options={undefined as any} onChange={jest.fn()} />);
            expect(container).toBeEmptyDOMElement();
        });
    });
});
