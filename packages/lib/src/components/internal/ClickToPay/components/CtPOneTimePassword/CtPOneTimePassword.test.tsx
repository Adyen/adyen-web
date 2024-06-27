import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { CoreProvider } from '../../../../../core/Context/CoreProvider';
import ClickToPayProvider from '../../context/ClickToPayProvider';
import { IClickToPayService } from '../../services/types';
import { mock } from 'jest-mock-extended';
import userEvent from '@testing-library/user-event';
import CtPOneTimePassword from './CtPOneTimePassword';

const customRender = (ui, { clickToPayService = mock<IClickToPayService>(), configuration = {} } = {}) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <ClickToPayProvider
                clickToPayService={clickToPayService}
                isStandaloneComponent={true}
                amount={{ value: 5000, currency: 'USD' }}
                onSetStatus={jest.fn()}
                configuration={configuration}
                onError={jest.fn()}
                onSubmit={jest.fn()}
                setClickToPayRef={jest.fn()}
            >
                {ui}
            </ClickToPayProvider>
        </CoreProvider>
    );
};

describe('Click to Pay - CtPOneTimePassword', () => {
    test('should set to store the cookie if shopper ticks the checkbox', async () => {
        const user = userEvent.setup();
        const ctpServiceMock = mock<IClickToPayService>();
        ctpServiceMock.schemes = ['visa', 'mc'];
        // const onResendCodeMock = jest.fn();

        customRender(<CtPOneTimePassword />, { clickToPayService: ctpServiceMock });

        // Default false
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const checkbox = (await screen.findByLabelText('Skip verification next time')) as HTMLInputElement;
        expect(checkbox.checked).toBe(false);

        // Checked
        await user.click(checkbox);
        expect(checkbox.checked).toBe(true);
        expect(ctpServiceMock.updateStoreCookiesConsent).toHaveBeenCalledWith(true);
        expect(ctpServiceMock.updateStoreCookiesConsent).toHaveBeenCalledTimes(1);

        // Unchecked
        await user.click(checkbox);
        expect(checkbox.checked).toBe(false);
        expect(ctpServiceMock.updateStoreCookiesConsent).toHaveBeenCalledWith(false);
        expect(ctpServiceMock.updateStoreCookiesConsent).toHaveBeenCalledTimes(2);
    });

    test('should pass OTP to ClickToPay service', async () => {
        const user = userEvent.setup({ delay: 100 });
        const ctpServiceMock = mock<IClickToPayService>();
        ctpServiceMock.schemes = ['visa', 'mc'];

        customRender(<CtPOneTimePassword />, { clickToPayService: ctpServiceMock });

        await screen.findByLabelText('One time code', { exact: false });

        await user.keyboard('654321');
        await user.keyboard('[Enter]');

        expect(ctpServiceMock.finishIdentityValidation).toHaveBeenCalledWith('654321');
    });
});
