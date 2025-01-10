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
            loadingContext: 'test',
            modules: { resources: global.resources }
        });

        render(payTo.render());
        expect(await screen.findByText(/Enter the PayID and account details that are connected to your Payto account./i)).toBeTruthy();
        expect(await screen.findByLabelText(/Prefix/i)).toBeTruthy();
        expect(await screen.findByLabelText(/Telephone number/i)).toBeTruthy(); // TODO this should be mobile number
        expect(await screen.findByLabelText(/First name/i)).toBeTruthy();
        expect(await screen.findByLabelText(/Last name/i)).toBeTruthy();
    });

    test('should render continue button', async () => {
        const payTo = new PayTo(global.core, {
            onSubmit: onSubmitMock,
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
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources },
            showPayButton: false
        });

        render(payTo.render());

        await user.click(screen.queryByRole('button', { name: 'Mobile' }));
        await user.click(screen.queryByRole('option', { name: /Email/i }));

        expect(await screen.findByLabelText(/Prefix/i)).toBeFalsy();
        expect(await screen.findByLabelText(/Email/i)).toBeTruthy();
    });
});
