import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import Select from './Select';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import SRPanelProvider from '../../../../core/Errors/SRPanelProvider';
import { SRPanel } from '../../../../core/Errors/SRPanel';

describe('Select', () => {
    const user = userEvent.setup();
    const srPanel = new SRPanel(global.core);
    const renderSelect = (props: any) =>
        render(
            <CoreProvider loadingContext={'test'} i18n={global.i18n} resources={global.resources}>
                <SRPanelProvider srPanel={srPanel}>
                    <Select {...props} name={'mockSelect'} />
                </SRPanelProvider>
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

        expect(onChangeCb).toBeCalledTimes(0);

        renderSelect({
            items: items,
            filterable: false,
            selected: value,
            onChange: onChangeCb
        });

        await user.click(screen.getByRole('button'));

        await user.click(screen.getByText('Issuer 3'));

        const callbackData = { target: { name: 'mockSelect', value: '3' } };

        expect(onChangeCb).toBeCalledTimes(1);
        expect(onChangeCb.mock.calls[0][0]).toStrictEqual(callbackData);

        // Test new option is displayed
        screen.getByRole('button').focus();

        // Test keyboard interaction
        await user.keyboard('[ArrowDown][Enter]');
        expect(onChangeCb).toBeCalledTimes(2);

        await user.keyboard('[ArrowUp][Space]');
        expect(onChangeCb).toBeCalledTimes(3);
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

        expect(onChangeCb).toBeCalledTimes(0);

        renderSelect({
            items: items,
            filterable: true,
            selected: value,
            onChange: onChangeCb
        });

        await user.click(screen.getByRole('combobox'));

        await user.click(screen.getByText('French Polynesia'));

        const callbackData = { target: { name: 'mockSelect', value: 'PF' } };

        expect(onChangeCb).toBeCalledTimes(1);
        expect(onChangeCb.mock.calls[0][0]).toStrictEqual(callbackData);

        // Test new option is displayed
        screen.getByRole('combobox').focus();

        // Test keyboard interaction
        await user.keyboard('[ArrowDown][Enter]');
        expect(onChangeCb).toBeCalledTimes(2);

        await user.keyboard('[ArrowUp][Space]');
        // Should NOT trigger on space
        expect(onChangeCb).toBeCalledTimes(2);
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
        combobox.focus();
        
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

        const button = screen.getByRole('button');
        
        // Focus should not open the dropdown
        button.focus();
        
        // Debug visibility
        const option1 = screen.getByText('Option 1');
        const option2 = screen.getByText('Option 2');
        
        // Elements should be hidden (offsetParent is null and getBoundingClientRect is all zeros)
        expect(option1.offsetParent).toBeNull();
        expect(option2.offsetParent).toBeNull();
        
        // Click should open the dropdown
        await user.click(button);
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

    test('SRPanel announces no options found message', async () => {
        const setSRMessagesSpy = jest.spyOn(srPanel, 'setMessages');
        
        renderSelect({
            items: [{ name: 'Apple', id: '1' }],
            filterable: true,
            selectedValue: '',
            onChange: jest.fn()
        });

        const combobox = screen.getByRole('combobox');
        
        // Type something that won't match any items
        await user.type(combobox, 'xyz');
        
        // Check that SRPanel.setMessages was called with the no options message
        expect(setSRMessagesSpy).toHaveBeenCalledWith('No options found');
        
        setSRMessagesSpy.mockRestore();
    });

    test('SRPanel is cleared when options are available', async () => {
        const setSRMessagesSpy = jest.spyOn(srPanel, 'setMessages');
        
        renderSelect({
            items: [{ name: 'Apple', id: '1' }],
            filterable: true,
            selectedValue: '',
            onChange: jest.fn()
        });

        const combobox = screen.getByRole('combobox');

        await user.type(combobox, 'App'); // search for Apple

        // SRPanel should be cleared (called with null) when there are options
        expect(setSRMessagesSpy).toHaveBeenCalledWith(null);
        
        setSRMessagesSpy.mockRestore();
    });
});
