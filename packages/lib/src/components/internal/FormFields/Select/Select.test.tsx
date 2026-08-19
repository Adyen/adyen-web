import { h } from 'preact';
import { render, screen, within, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import Select from './Select';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';

const core = setupCoreMock();

describe('Select', () => {
    const user = userEvent.setup();
    const renderSelect = (props: any) =>
        render(
            <CoreProvider loadingContext={'test'} i18n={core.modules.i18n} resources={core.modules.resources}>
                <Select {...props} name={'mockSelect'} />
            </CoreProvider>
        );

    test('Options list should select with correct inputs', async () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];
        let value = '1';
        const onChangeCb = jest.fn(e => {
            value = e.target.value;
        });

        expect(onChangeCb).toHaveBeenCalledTimes(0);

        renderSelect({
            items: items,
            filterable: false,
            selected: value,
            onChange: onChangeCb
        });

        await user.click(screen.getByRole('combobox'));

        await user.click(screen.getByText('Issuer 3'));

        const callbackData = { target: { name: 'mockSelect', value: '3' } };

        expect(onChangeCb).toHaveBeenCalledTimes(1);
        expect(onChangeCb.mock.calls[0][0]).toStrictEqual(callbackData);

        // Test keyboard interaction - focus the button first with user event
        const button = screen.getByRole('combobox');
        await user.click(button); // Open dropdown

        await user.keyboard('[ArrowDown][Enter]');
        expect(onChangeCb).toHaveBeenCalledTimes(2);

        await user.keyboard('[ArrowUp][Space]');
        expect(onChangeCb).toHaveBeenCalledTimes(3);
    });

    test('Combobox list should select with correct inputs', async () => {
        const items = [
            { name: 'Peru', id: 'PE' },
            { name: 'French Polynesia', id: 'PF' },
            { name: 'Poland', id: 'PL' },
            { name: 'Portugal', id: 'PT' },
            { name: 'Singapore', id: 'SG' }
        ];
        let value = '';
        const onChangeCb = jest.fn(e => {
            value = e.target.value;
        });

        expect(onChangeCb).toHaveBeenCalledTimes(0);

        renderSelect({
            items: items,
            filterable: true,
            selected: value,
            onChange: onChangeCb
        });

        await user.click(screen.getByRole('combobox'));

        await user.click(screen.getByText('French Polynesia'));

        const callbackData = { target: { name: 'mockSelect', value: 'PF' } };

        expect(onChangeCb).toHaveBeenCalledTimes(1);
        expect(onChangeCb.mock.calls[0][0]).toStrictEqual(callbackData);

        // Test keyboard interaction - focus the combobox first with user event
        const combobox = screen.getByRole('combobox');
        await user.click(combobox); // Open dropdown

        await user.keyboard('[ArrowDown][Enter]');
        expect(onChangeCb).toHaveBeenCalledTimes(2);

        await user.keyboard('[ArrowUp][Space]');
        // Should NOT trigger on space
        expect(onChangeCb).toHaveBeenCalledTimes(2);
    });

    test('Focus should not open dropdown but click should open it', async () => {
        const items = [
            { name: 'Option 1', id: '1' },
            { name: 'Option 2', id: '2' }
        ];

        renderSelect({
            items: items,
            filterable: true,
            selectedValue: '',
            onChange: jest.fn()
        });

        const combobox = screen.getByRole('combobox');

        // Focus should not open the dropdown
        await user.tab(); // Focus the combobox using tab navigation

        // Debug visibility
        const option1 = screen.getByText('Option 1');
        const option2 = screen.getByText('Option 2');

        // Elements should be hidden (offsetParent is null and getBoundingClientRect is all zeros)
        expect(option1.offsetParent).toBeNull();
        expect(option2.offsetParent).toBeNull();

        // Click should open the dropdown
        await user.click(combobox);
        expect(screen.getByText('Option 1')).toBeVisible();
        expect(screen.getByText('Option 2')).toBeVisible();
    });

    test('Focus should not open dropdown for non-filterable select but click should open it', async () => {
        const items = [
            { name: 'Option 1', id: '1' },
            { name: 'Option 2', id: '2' }
        ];

        renderSelect({
            items: items,
            filterable: false,
            selectedValue: '',
            onChange: jest.fn()
        });

        const combobox = screen.getByRole('combobox');

        // Focus should not open the dropdown
        await user.tab(); // Focus the combobox using tab navigation

        // Debug visibility
        const option1 = screen.getByText('Option 1');
        const option2 = screen.getByText('Option 2');

        // Elements should be hidden (offsetParent is null and getBoundingClientRect is all zeros)
        expect(option1.offsetParent).toBeNull();
        expect(option2.offsetParent).toBeNull();

        // Click should open the dropdown
        await user.click(combobox);
        expect(screen.getByText('Option 1')).toBeVisible();
        expect(screen.getByText('Option 2')).toBeVisible();
    });

    test('Typing should open dropdown for filterable select', async () => {
        const items = [
            { name: 'Apple', id: '1' },
            { name: 'Banana', id: '2' },
            { name: 'Cherry', id: '3' }
        ];

        renderSelect({
            items: items,
            filterable: true,
            selectedValue: '',
            onChange: jest.fn()
        });

        const combobox = screen.getByRole('combobox');

        // Initially dropdown should be closed
        const apple = screen.getByText('Apple');
        const banana = screen.getByText('Banana');

        // Elements should be hidden (offsetParent is null and getBoundingClientRect is all zeros)
        expect(apple.offsetParent).toBeNull();
        expect(banana.offsetParent).toBeNull();

        // Typing should open the dropdown
        await user.type(combobox, 'A');
        expect(screen.getByText('Apple')).toBeVisible();
    });

    test('ARIA live region announces no options found message', async () => {
        renderSelect({
            items: [{ name: 'Apple', id: '1' }],
            filterable: true,
            selectedValue: '',
            onChange: jest.fn()
        });

        const combobox = screen.getByRole('combobox');

        // Type something that won't match any items
        await user.type(combobox, 'xyz');

        // Check that the live region is present and contains the no options message
        const liveRegion = screen.getByRole('status');
        expect(liveRegion).toBeInTheDocument();
        await waitFor(() => expect(liveRegion).toHaveTextContent('No options found'));
        expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    test('ARIA live region is empty when options are available', async () => {
        renderSelect({
            items: [{ name: 'Apple', id: '1' }],
            filterable: true,
            selectedValue: '',
            onChange: jest.fn()
        });

        const combobox = screen.getByRole('combobox');

        await user.type(combobox, 'App'); // search for Apple

        // Live region should be present but empty when there are options
        const liveRegion = screen.getByRole('status');
        expect(liveRegion).toBeInTheDocument();
        expect(liveRegion).toBeEmptyDOMElement();
    });

    describe('select-only (filterable=false)', () => {
        test('aria-expanded is false initially and true when open', async () => {
            renderSelect({ filterable: false });
            const combobox = screen.getByRole('combobox');
            expect(combobox).toHaveAttribute('aria-expanded', 'false');
            await user.click(combobox);
            expect(combobox).toHaveAttribute('aria-expanded', 'true');
        });

        test('button has aria-haspopup="listbox"', () => {
            renderSelect({ filterable: false });
            expect(screen.getByRole('combobox')).toHaveAttribute('aria-haspopup', 'listbox');
        });

        test('button has aria-controls pointing to the listbox', () => {
            renderSelect({ filterable: false });
            const combobox = screen.getByRole('combobox');
            const listbox = screen.getByRole('listbox');
            expect(combobox).toHaveAttribute('aria-controls', listbox.id);
        });

        test('button has aria-labelledby combining label and selected value when uniqueId is provided', () => {
            renderSelect({ filterable: false, uniqueId: 'test-select', selectedValue: '1', items: [{ id: '1', name: 'Mobile' }] });
            const combobox = screen.getByRole('combobox');
            expect(combobox).toHaveAttribute('aria-labelledby', 'test-select-label test-select-value');
            expect(within(combobox).getByText('Mobile')).toBeInTheDocument();
        });
    });

    describe('combobox (filterable=true) click targets', () => {
        const items = [
            { name: 'Option 1', id: '1' },
            { name: 'Option 2', id: '2' }
        ];

        //Since the chevron is a pseudo element, clicking the wrapper is equivalent
        const getChevron = (): HTMLElement => {
            // eslint-disable-next-line testing-library/no-node-access
            const wrapper = screen.getByRole('combobox').closest<HTMLElement>('.adyen-checkout__dropdown__button');
            if (!wrapper) throw new Error('The dropdown button wrapper was not found');
            return wrapper;
        };

        test('clicking the chevron opens the list and moves focus to the filter input', async () => {
            renderSelect({ items, filterable: true, selectedValue: '1' });
            await user.click(getChevron());
            expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
            expect(screen.getByRole('combobox')).toHaveFocus();
        });

        test('clicking the chevron of an open list closes it again', async () => {
            renderSelect({ items, filterable: true, selectedValue: '1' });
            await user.click(getChevron());
            expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
            await user.click(getChevron());
            expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
        });

        test('clicking the filter input of an open list keeps it open', async () => {
            renderSelect({ items, filterable: true, selectedValue: '1' });
            const combobox = screen.getByRole('combobox');
            await user.click(combobox);
            await user.click(combobox);
            expect(combobox).toHaveAttribute('aria-expanded', 'true');
        });
    });

    describe('selected item icon', () => {
        const items = [
            { name: 'Option 1', id: '1', icon: 'option-1.svg' },
            { name: 'Option 2', id: '2', icon: 'option-2.svg' }
        ];

        test('renders the icon of the selected item inside the select-only button', () => {
            renderSelect({ items, filterable: false, selectedValue: '1' });

            expect(within(screen.getByRole('combobox')).getByRole('img', { name: 'Option 1' })).toBeInTheDocument();
        });

        test('renders the icon of the selected item in the collapsed combobox and drops it once the list opens', async () => {
            renderSelect({ items, filterable: true, selectedValue: '1' });

            // the collapsed combobox icon plus the icon of the matching option in the list
            expect(screen.getAllByRole('img', { name: 'Option 1' })).toHaveLength(2);

            await user.click(screen.getByRole('combobox'));

            expect(screen.getAllByRole('img', { name: 'Option 1' })).toHaveLength(1);
        });
    });

    describe('readonly', () => {
        const items = [
            { name: 'Option 1', id: '1' },
            { name: 'Option 2', id: '2' }
        ];

        test('clicking a readonly select-only dropdown does not open the list', async () => {
            const onChange = jest.fn();
            renderSelect({ items, filterable: false, readonly: true, selectedValue: '1', onChange });

            const combobox = screen.getByRole('combobox');
            await user.click(combobox);

            expect(combobox).toHaveAttribute('aria-expanded', 'false');
            expect(combobox).toHaveAttribute('aria-disabled', 'true');
            expect(onChange).not.toHaveBeenCalled();
        });

        test('clicking a readonly combobox does not open the list', async () => {
            const onChange = jest.fn();
            renderSelect({ items, filterable: true, readonly: true, selectedValue: '1', onChange });

            const combobox = screen.getByRole('combobox');
            await user.click(combobox);

            expect(combobox).toHaveAttribute('aria-expanded', 'false');
            expect(combobox).toHaveAttribute('aria-disabled', 'true');
            expect(onChange).not.toHaveBeenCalled();
        });
    });

    describe('selected option', () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];

        test('marks the selected option and the checkmark adds no text to its accessible name', async () => {
            renderSelect({ items, filterable: false, selectedValue: '2' });

            await user.click(screen.getByRole('combobox'));

            const options = screen.getAllByRole('option');

            expect(options[1]).toHaveAttribute('aria-selected', 'true');
            expect(options[1]).toHaveAccessibleName('Issuer 2');
        });

        test('keeps exactly one option selected when the selection changes', async () => {
            const view = renderSelect({ items, filterable: false, selectedValue: '1' });

            await user.click(screen.getByRole('combobox'));
            expect(screen.getByRole('option', { name: 'Issuer 1' })).toHaveAttribute('aria-selected', 'true');

            view.rerender(
                <CoreProvider loadingContext={'test'} i18n={core.modules.i18n} resources={core.modules.resources}>
                    <Select items={items} filterable={false} selectedValue={'3'} name={'mockSelect'} />
                </CoreProvider>
            );

            const selectedOptions = screen.getAllByRole('option').filter(option => option.getAttribute('aria-selected') === 'true');

            expect(selectedOptions).toHaveLength(1);
            expect(screen.getByRole('option', { name: 'Issuer 3' })).toHaveAttribute('aria-selected', 'true');
        });
    });

    describe('filtering', () => {
        test('does not match on secondaryText', async () => {
            renderSelect({
                items: [{ name: 'Apple', id: '1', secondaryText: 'Supporting text' }],
                filterable: true,
                selectedValue: '',
                onChange: jest.fn()
            });

            await user.type(screen.getByRole('combobox'), 'Supporting');

            expect(screen.queryAllByRole('option')).toHaveLength(0);
            await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('No options found'));
        });
    });

    describe('disabled option', () => {
        const items = [
            { name: 'Option 1', id: '1' },
            { name: 'Option 2', id: '2' },
            { name: 'Option 3', id: '3', disabled: true }
        ];

        test('cannot be selected by click', async () => {
            const onChange = jest.fn();
            renderSelect({ items, filterable: false, onChange });

            await user.click(screen.getByRole('combobox'));
            await user.click(screen.getByRole('option', { name: 'Option 3' }));

            expect(onChange).not.toHaveBeenCalled();
        });

        test('cannot be selected by keyboard', async () => {
            const onChange = jest.fn();
            renderSelect({ items, filterable: false, onChange });

            const combobox = screen.getByRole('combobox');
            await user.click(combobox);
            await user.keyboard('[ArrowDown][ArrowDown][ArrowDown]');

            // Assert we actually landed on the disabled option, otherwise the expectation below passes vacuously
            expect(combobox).toHaveAttribute('aria-activedescendant', 'listItem-3');

            await user.keyboard('[Enter]');

            expect(onChange).not.toHaveBeenCalled();
        });
    });
});
