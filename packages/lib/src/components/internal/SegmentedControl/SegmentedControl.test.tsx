import { h } from 'preact';
import { useState } from 'preact/hooks';
import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import SegmentedControl, { SegmentedControlOptions } from './SegmentedControl';

const DEFAULT_OPTIONS: SegmentedControlOptions<string> = [
    {
        value: 'option 1',
        label: 'Option 1',
        id: 'option-1',
        controls: '1'
    },
    {
        value: 'option 2',
        label: 'Option 2',
        id: 'option-2',
        controls: '2'
    }
];
const Component = ({ options }: { options: SegmentedControlOptions<string> }) => {
    const defaultOption = options[0].value;
    const [selectedOption, setSelectedOption] = useState<string>(defaultOption);

    return <SegmentedControl selectedValue={selectedOption} options={options} onChange={setSelectedOption} />;
};

const renderSegmentedControl = (options: SegmentedControlOptions<string>) => {
    return render(<Component options={options} />);
};

describe('SegmentedControl', () => {
    test('should render segmented controls', () => {
        renderSegmentedControl(DEFAULT_OPTIONS);
        expect(screen.getByRole('button', { name: DEFAULT_OPTIONS[0].label })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: DEFAULT_OPTIONS[1].label })).toBeInTheDocument();
    });

    test('should switch between options', async () => {
        const user = userEvent.setup();
        renderSegmentedControl(DEFAULT_OPTIONS);

        expect(screen.getByRole('button', { name: DEFAULT_OPTIONS[0].label })).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('button', { name: DEFAULT_OPTIONS[1].label })).not.toHaveAttribute('aria-expanded', 'true');

        const option2Button = await screen.findByRole('button', { name: DEFAULT_OPTIONS[1].label });
        await user.click(option2Button);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: DEFAULT_OPTIONS[1].label })).toHaveAttribute('aria-expanded', 'true');
        });

        expect(screen.getByRole('button', { name: DEFAULT_OPTIONS[0].label })).not.toHaveAttribute('aria-expanded', 'true');

        const option1Button = await screen.findByRole('button', { name: DEFAULT_OPTIONS[0].label });
        await user.click(option1Button);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: DEFAULT_OPTIONS[0].label })).toHaveAttribute('aria-expanded', 'true');
        });

        expect(screen.getByRole('button', { name: DEFAULT_OPTIONS[1].label })).not.toHaveAttribute('aria-expanded', 'true');
    });
});
