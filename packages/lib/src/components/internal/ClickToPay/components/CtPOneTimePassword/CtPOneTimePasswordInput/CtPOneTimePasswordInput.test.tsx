import { h } from 'preact';
import { render, screen, waitFor } from '@testing-library/preact';
import { CoreProvider } from '../../../../../../core/Context/CoreProvider';
import ClickToPayProvider from '../../../context/ClickToPayProvider';
import { IClickToPayService } from '../../../services/types';
import { mock } from 'jest-mock-extended';
import CtPOneTimePasswordInput from './CtPOneTimePasswordInput';
import userEvent from '@testing-library/user-event';

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

describe('Click to Pay - CtPOneTimePasswordInput', () => {
    test('should resend OTP when clicking on "Resend" button and focus back on the input', async () => {
        const user = userEvent.setup();
        const ctpServiceMock = mock<IClickToPayService>();
        const onResendCodeMock = jest.fn();

        customRender(
            <CtPOneTimePasswordInput
                isValidatingOtp={false}
                hideResendOtpButton={false}
                disabled={false}
                onSetInputHandlers={jest.fn()}
                onPressEnter={jest.fn()}
                onChange={jest.fn()}
                onResendCode={onResendCodeMock}
            />,
            { clickToPayService: ctpServiceMock }
        );

        const resendOtpLink = await screen.findByRole('link', { name: 'Resend code' });
        const otpInput = screen.getByLabelText('One time code', { exact: false });

        await user.click(resendOtpLink);

        expect(onResendCodeMock).toHaveBeenCalledTimes(1);
        expect(otpInput).toHaveFocus();
        expect(screen.getByText('Code resent')).toBeVisible();
        expect(ctpServiceMock.startIdentityValidation).toHaveBeenCalledTimes(1);
    });

    test('should resend OTP when clicking on "Resend" button and NOT focus back on the input', async () => {
        const user = userEvent.setup();
        const ctpServiceMock = mock<IClickToPayService>();
        const configuration = {
            disableOtpAutoFocus: true
        };

        const onResendCodeMock = jest.fn();

        customRender(
            <CtPOneTimePasswordInput
                isValidatingOtp={false}
                hideResendOtpButton={false}
                disabled={false}
                onSetInputHandlers={jest.fn()}
                onPressEnter={jest.fn()}
                onChange={jest.fn()}
                onResendCode={onResendCodeMock}
            />,
            { clickToPayService: ctpServiceMock, configuration }
        );

        const resendOtpLink = await screen.findByRole('link', { name: 'Resend code' });
        const otpInput = screen.getByLabelText('One time code', { exact: false });

        await user.click(resendOtpLink);

        expect(onResendCodeMock).toHaveBeenCalledTimes(1);
        expect(otpInput).not.toHaveFocus();
        expect(screen.getByText('Code resent')).toBeVisible();
        expect(ctpServiceMock.startIdentityValidation).toHaveBeenCalledTimes(1);
    });

    test('should focus on the OTP input once the component is loaded', async () => {
        const user = userEvent.setup({ delay: 100 });
        customRender(
            <CtPOneTimePasswordInput
                isValidatingOtp={false}
                hideResendOtpButton={false}
                disabled={false}
                onSetInputHandlers={jest.fn()}
                onPressEnter={jest.fn()}
                onChange={jest.fn()}
                onResendCode={jest.fn()}
            />
        );

        const otpInput = await screen.findByLabelText('One time code', { exact: false });

        await user.keyboard('654321');

        expect(otpInput).toHaveValue('654321');
        expect(otpInput).toHaveFocus();
    });

    test('should NOT focus on the OTP input once the component is loaded', async () => {
        const user = userEvent.setup({ delay: 100 });
        const configuration = {
            disableOtpAutoFocus: true
        };
        customRender(
            <CtPOneTimePasswordInput
                isValidatingOtp={false}
                hideResendOtpButton={false}
                disabled={false}
                onSetInputHandlers={jest.fn()}
                onPressEnter={jest.fn()}
                onChange={jest.fn()}
                onResendCode={jest.fn()}
            />,
            { configuration }
        );

        const otpInput = await screen.findByLabelText('One time code', { exact: false });

        await user.keyboard('654321');

        expect(otpInput).toHaveValue('');
        expect(otpInput).not.toHaveFocus();
    });

    test('should trigger callback when pressing ENTER while OTP input is focused', async () => {
        const user = userEvent.setup({ delay: 100 });
        const onPressEnterMock = jest.fn();

        customRender(
            <CtPOneTimePasswordInput
                isValidatingOtp={false}
                hideResendOtpButton={false}
                disabled={false}
                onSetInputHandlers={jest.fn()}
                onPressEnter={onPressEnterMock}
                onChange={jest.fn()}
                onResendCode={jest.fn()}
            />
        );

        await waitFor(() => expect(screen.queryByLabelText('One time code', { exact: false })).toBeVisible());
        await user.keyboard('[Enter]');

        expect(onPressEnterMock).toHaveBeenCalledTimes(1);
    });
});
