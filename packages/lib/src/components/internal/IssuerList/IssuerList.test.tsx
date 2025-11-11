import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { h } from 'preact';
import IssuerList from './IssuerList';
import PayButton from '../PayButton';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { ANALYTICS_FEATURED_ISSUER, ANALYTICS_LIST } from '../../../core/Analytics/constants';
import { InfoEventType } from '../../../core/Analytics/events/AnalyticsInfoEvent';

/**
 * DON'T USE THIS FILE
 * This file should be deprecated, there's very litle reason to test IssuerList without it's container
 * All these tests are misleading, becaused clicking on Pay Button doesn't trigger the usual component submit logic
 * IMPORTANT: For any kind of integration test use IssuerListContainer instead
 */

describe('IssuerList', () => {
    test('Accepts Items as props', () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];
        render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <IssuerList
                    items={items}
                    showPayButton={false}
                    onChange={jest.fn()}
                    payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
                    onSubmitAnalytics={() => {}}
                    type={'onlineBanking_PL'}
                />
            </CoreProvider>
        );
        const listItems = screen.getAllByRole('option');
        expect(listItems).toHaveLength(3);
        expect(screen.getByText('Issuer 1')).toBeInTheDocument();
        expect(screen.getByText('Issuer 2')).toBeInTheDocument();
        expect(screen.getByText('Issuer 3')).toBeInTheDocument();
    });

    test('Renders highlighted issuers button group', () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];
        const highlightedIds = ['2', '3'];

        render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <IssuerList
                    items={items}
                    highlightedIds={highlightedIds}
                    showPayButton={false}
                    onChange={jest.fn()}
                    payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
                    onSubmitAnalytics={() => {}}
                    type={'onlineBanking_PL'}
                />
            </CoreProvider>
        );
        const highlightedButtons = screen
            .getAllByRole('button')
            .filter(button => button.textContent === 'Issuer 2' || button.textContent === 'Issuer 3');
        expect(highlightedButtons).toHaveLength(2);
    });

    test('Clicking in a highlighted issuer trigger onChange callback', async () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];
        const highlightedIds = ['2', '3'];
        const onChangeCb = jest.fn();

        expect(onChangeCb).toBeCalledTimes(0);

        render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <IssuerList
                    items={items}
                    highlightedIds={highlightedIds}
                    showPayButton={false}
                    onChange={onChangeCb}
                    payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
                    onSubmitAnalytics={() => {}}
                    type={'onlineBanking_PL'}
                />
            </CoreProvider>
        );

        let callbackData = { data: { issuer: null }, valid: { issuer: false }, errors: { issuer: null }, isValid: false };

        expect(onChangeCb).toBeCalledTimes(2);
        expect(onChangeCb.mock.calls[0][0]).toStrictEqual(callbackData);
        expect(onChangeCb.mock.calls[1][0]).toStrictEqual(callbackData);

        const user = userEvent.setup();
        const issuer3Button = screen.getByRole('button', { name: 'Issuer 3' });
        await user.click(issuer3Button);

        callbackData = { data: { issuer: '3' }, valid: { issuer: true }, errors: { issuer: null }, isValid: true };

        await waitFor(() => {
            expect(onChangeCb).toBeCalledTimes(3);
        });
        expect(onChangeCb.mock.calls[2][0]).toStrictEqual(callbackData);
    });

    test('UI should not render invalid highlighted issuers', () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];
        const highlightedIds = ['3', '4', '5'];

        render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <IssuerList
                    items={items}
                    highlightedIds={highlightedIds}
                    showPayButton={false}
                    onChange={jest.fn()}
                    payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
                    onSubmitAnalytics={() => {}}
                    type={'onlineBanking_PL'}
                />
            </CoreProvider>
        );

        const highlightedButtons = screen.getAllByRole('button').filter(button => button.textContent === 'Issuer 3');

        expect(highlightedButtons).toHaveLength(1);
        expect(highlightedButtons[0]).toHaveTextContent('Issuer 3');
    });

    test('Highlighted issuer is rendered as Button and as part of the dropdown', () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];
        const highlightedIds = ['3'];

        render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <IssuerList
                    items={items}
                    highlightedIds={highlightedIds}
                    showPayButton={false}
                    onChange={jest.fn()}
                    payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
                    onSubmitAnalytics={() => {}}
                    type={'onlineBanking_PL'}
                />
            </CoreProvider>
        );

        const highlightedIssuerButton = screen.getByRole('button', { name: 'Issuer 3' });
        const highlightedIssuerDropdownItem = screen.getByRole('option', { name: 'Issuer 3' });

        expect(highlightedIssuerButton).toHaveTextContent('Issuer 3');
        expect(highlightedIssuerDropdownItem).toHaveTextContent('Issuer 3');
        expect(highlightedIssuerButton).toHaveAttribute('value', '3');
        expect(highlightedIssuerDropdownItem).toHaveAttribute('data-value', '3');
    });
});

describe('Analytics', () => {
    test('should send "selected" event when shopper clicks on a highlighted issuer button', async () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];
        const highlightedIds = ['2', '3'];
        const onSubmitAnalytics = jest.fn();

        render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <IssuerList
                    items={items}
                    highlightedIds={highlightedIds}
                    showPayButton={false}
                    onChange={() => {}}
                    payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
                    onSubmitAnalytics={onSubmitAnalytics}
                    type={'onlineBanking_PL'}
                />
            </CoreProvider>
        );

        const user = userEvent.setup();
        const issuer3Button = screen.getByRole('button', { name: 'Issuer 3' });
        await user.click(issuer3Button);

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(1);
        expect(onSubmitAnalytics).toHaveBeenCalledWith(
            expect.objectContaining({
                type: InfoEventType.selected,
                target: ANALYTICS_FEATURED_ISSUER,
                issuer: 'Issuer 3'
            })
        );
    });

    test('should send "selected" event when shopper clicks on a issuer in the dropdown', async () => {
        const items = [
            { name: 'Issuer 1', id: '1' },
            { name: 'Issuer 2', id: '2' },
            { name: 'Issuer 3', id: '3' }
        ];
        const onSubmitAnalytics = jest.fn();

        render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <IssuerList
                    items={items}
                    showPayButton={false}
                    onChange={() => {}}
                    payButton={props => <PayButton {...props} amount={{ value: 50, currency: 'USD' }} />}
                    onSubmitAnalytics={onSubmitAnalytics}
                    type={'onlineBanking_PL'}
                />
            </CoreProvider>
        );

        const user = userEvent.setup();
        const issuer2DropdownItem = screen.getByRole('option', { name: 'Issuer 2' });
        await user.click(issuer2DropdownItem);

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(1);
        expect(onSubmitAnalytics).toHaveBeenCalledWith(
            expect.objectContaining({
                type: InfoEventType.selected,
                target: ANALYTICS_LIST,
                issuer: 'Issuer 2'
            })
        );
    });
});
