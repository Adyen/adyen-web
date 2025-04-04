import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import FastlaneSignup from './FastlaneSignup';
import type { FastlaneSignupConfiguration } from '../../../PayPalFastlane/types';
import userEvent from '@testing-library/user-event';

const customRender = ui => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            {ui}
        </CoreProvider>
    );
};

test('should trigger onChange event if the consent UI is not allowed to be shown (showConsent: false)', () => {
    const fastlaneConfiguration: FastlaneSignupConfiguration = {
        showConsent: false,
        fastlaneSessionId: 'fastlane-session-id',
        defaultToggleState: undefined,
        termsAndConditionsLink: undefined,
        termsAndConditionsVersion: undefined,
        privacyPolicyLink: undefined
    };

    const onChangeMock = jest.fn();

    customRender(<FastlaneSignup {...fastlaneConfiguration} onChange={onChangeMock} currentDetectedBrand="card" onSubmitAnalytics={jest.fn()} />);

    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock.mock.calls[0][0]).toEqual({
        fastlaneData: {
            consentGiven: false,
            consentShown: false,
            fastlaneSessionId: 'fastlane-session-id'
        }
    });
});

test('should send "consentShown:true" flag if the shopper saw the consent UI at least once', async () => {
    const user = userEvent.setup();

    const fastlaneConfiguration: FastlaneSignupConfiguration = {
        showConsent: true,
        defaultToggleState: false,
        termsAndConditionsLink: 'https://adyen.com',
        termsAndConditionsVersion: 'v1',
        privacyPolicyLink: 'https://adyen.com',
        fastlaneSessionId: 'xxx-bbb'
    };

    const onChangeMock = jest.fn();

    customRender(<FastlaneSignup {...fastlaneConfiguration} onChange={onChangeMock} currentDetectedBrand="mc" onSubmitAnalytics={jest.fn()} />);

    // Show the UI
    await user.click(screen.getByRole('switch'));
    expect(screen.getByLabelText('Mobile number')).toBeVisible();

    // Hide the UI
    await user.click(screen.getByRole('switch'));
    expect(screen.queryByText('Mobile number')).toBeNull();

    expect(onChangeMock).lastCalledWith({
        fastlaneData: {
            consentGiven: false,
            consentShown: true,
            consentVersion: 'v1',
            fastlaneSessionId: 'xxx-bbb'
        }
    });
});

test('should return phone number formatted (without spaces and without prefix)', async () => {
    const user = userEvent.setup();

    const fastlaneConfiguration: FastlaneSignupConfiguration = {
        showConsent: true,
        defaultToggleState: true,
        termsAndConditionsLink: 'https://adyen.com',
        termsAndConditionsVersion: 'v1',
        privacyPolicyLink: 'https://adyen.com',
        fastlaneSessionId: 'xxx-bbb'
    };

    const onChangeMock = jest.fn();

    customRender(<FastlaneSignup {...fastlaneConfiguration} onChange={onChangeMock} currentDetectedBrand="visa" onSubmitAnalytics={jest.fn()} />);

    const input = screen.getByLabelText('Mobile number');

    await user.click(input);
    await user.keyboard('8005550199');

    expect(onChangeMock).lastCalledWith({
        fastlaneData: {
            consentGiven: true,
            consentShown: true,
            consentVersion: 'v1',
            fastlaneSessionId: 'xxx-bbb',
            telephoneNumber: '8005550199'
        }
    });
});

test('should display terms and privacy statement links', () => {
    const fastlaneConfiguration: FastlaneSignupConfiguration = {
        showConsent: true,
        defaultToggleState: true,
        termsAndConditionsLink: 'https://fastlane.com/terms',
        termsAndConditionsVersion: 'v1',
        privacyPolicyLink: 'https://fastlane.com/privacy-policy',
        fastlaneSessionId: 'xxx-bbb'
    };

    const onChangeMock = jest.fn();

    customRender(<FastlaneSignup {...fastlaneConfiguration} onChange={onChangeMock} currentDetectedBrand="visa" onSubmitAnalytics={jest.fn()} />);

    expect(screen.getByRole('link', { name: 'terms' })).toHaveAttribute('href', 'https://fastlane.com/terms');
    expect(screen.getByRole('link', { name: 'privacy statement' })).toHaveAttribute('href', 'https://fastlane.com/privacy-policy');
});

test('should open Fastlane info dialog and close it', async () => {
    const user = userEvent.setup();

    const fastlaneConfiguration: FastlaneSignupConfiguration = {
        showConsent: true,
        defaultToggleState: true,
        termsAndConditionsLink: 'https://fastlane.com/terms',
        termsAndConditionsVersion: 'v1',
        privacyPolicyLink: 'https://fastlane.com/privacy-policy',
        fastlaneSessionId: 'xxx-bbb'
    };

    const onChangeMock = jest.fn();

    customRender(<FastlaneSignup {...fastlaneConfiguration} onChange={onChangeMock} currentDetectedBrand="visa" onSubmitAnalytics={jest.fn()} />);

    screen.getByRole('dialog', { hidden: true });

    const dialogButton = screen.getByRole('button', { name: /read more/i });
    await user.click(dialogButton);
    screen.getByRole('dialog', { hidden: false });

    const closeDialogButton = screen.getByRole('button', { name: /close dialog/i });
    await user.click(closeDialogButton);
    screen.getByRole('dialog', { hidden: true });
});

test('should not render the UI if there are missing configuration fields', () => {
    // @ts-ignore Testing misconfigured component
    const fastlaneConfiguration: FastlaneSignupConfiguration = {
        showConsent: true,
        defaultToggleState: true,
        termsAndConditionsLink: 'http://invalidlink.com',
        privacyPolicyLink: 'https://fastlane.com/privacy-policy'
    };

    const onChangeMock = jest.fn();

    const consoleMock = jest.fn();
    jest.spyOn(console, 'warn').mockImplementation(consoleMock);

    const { container } = customRender(
        <FastlaneSignup {...fastlaneConfiguration} onChange={onChangeMock} currentDetectedBrand="visa" onSubmitAnalytics={jest.fn()} />
    );

    expect(consoleMock).toHaveBeenCalledTimes(1);
    expect(consoleMock).toHaveBeenCalledWith('Fastlane: Component configuration is not valid. Fastlane will not be displayed');

    expect(container).toBeEmptyDOMElement();
});
