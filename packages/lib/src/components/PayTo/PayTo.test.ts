import { render, screen } from '@testing-library/preact';
import PayTo from './PayTo';
import userEvent from '@testing-library/user-event';
import getDataset from '../../core/Services/get-dataset';

jest.mock('../../core/Services/get-dataset');
(getDataset as jest.Mock).mockImplementation(
    jest.fn(() => {
        return Promise.resolve([{ id: 'AUS', prefix: '+61' }]);
    })
);

const MOCK_MANDATE = {
    amount: '4001', // [Mandatory] for PayTo - Mandate Amount field
    amountRule: 'exact', // [Mandatory] for PayTo - Needs to be Localised
    endsAt: '2024-12-31', // [Mandatory] for PayTo - Date format
    frequency: 'adhoc', // [Mandatory] for PayTo - Needs to be Localised
    remarks: 'testThroughFlow1', // [Mandatory] for PayTo - Needs to be Localised as "Description"
    count: '3', // [Optional] will be returned only if the merchant sends it
    startsAt: '2024-11-13' // [Optional] will be returned only if the merchant sends it
};

describe('PayTo', () => {
    let onSubmitMock;
    let user;

    beforeEach(() => {
        onSubmitMock = jest.fn();
        user = userEvent.setup();
    });

    test('should render payment and show PayID page', async () => {
        const payTo = new PayTo(global.core, {
            i18n: global.i18n,
            mandate: MOCK_MANDATE,
            loadingContext: 'test',
            modules: { resources: global.resources }
        });

        render(payTo.render());
        expect(await screen.findByText(/Enter the PayID and account details that are connected to your Payto account./i)).toBeTruthy();
        expect(await screen.findByLabelText(/Prefix/i)).toBeTruthy();
        expect(await screen.findByLabelText(/Mobile number/i)).toBeTruthy();
        expect(await screen.findByLabelText(/First name/i)).toBeTruthy();
        expect(await screen.findByLabelText(/Last name/i)).toBeTruthy();
    });

    test('should render continue button', async () => {
        const payTo = new PayTo(global.core, {
            onSubmit: onSubmitMock,
            mandate: MOCK_MANDATE,
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources }
        });

        render(payTo.render());
        const button = await screen.findByRole('button', { name: 'Confirm purchase' });

        // check if button actually triggers submit
        await user.click(button);
        expect(onSubmitMock).toHaveBeenCalledTimes(0);

        //TODO check validation fails
    });

    test('should change to different identifier when selected', async () => {
        const payTo = new PayTo(global.core, {
            onSubmit: onSubmitMock,
            mandate: MOCK_MANDATE,
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources },
            showPayButton: false
        });

        render(payTo.render());

        await user.click(screen.queryByRole('button', { name: 'Mobile' }));
        await user.click(screen.queryByRole('option', { name: /Email/i }));

        expect(screen.queryByLabelText(/Prefix/i)).toBeFalsy();
        expect(screen.getByLabelText(/Email/i)).toBeTruthy();
    });
});
