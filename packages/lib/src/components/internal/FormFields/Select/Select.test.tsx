import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import Select from './Select';
import { CoreProvider } from '../../../../core/Context/CoreProvider';

describe('Select', () => {
    const user = userEvent.setup();
    const getWrapper = (props: any) =>
        render(
            <CoreProvider loadingContext={'test'} i18n={global.i18n} resources={global.resources}>
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

        expect(onChangeCb).toBeCalledTimes(0);

        getWrapper({
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
        await screen.getByRole('button').focus();

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

        getWrapper({
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
        await screen.getByRole('combobox').focus();

        // Test keyboard interaction
        await user.keyboard('[ArrowDown][Enter]');
        expect(onChangeCb).toBeCalledTimes(2);

        await user.keyboard('[ArrowUp][Space]');
        // Should NOT trigger on space
        expect(onChangeCb).toBeCalledTimes(2);
    });
});
