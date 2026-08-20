import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';

import GooglePayButton from './GooglePayButton';
import GooglePayService from '../GooglePayService';

describe('GooglePayButton', () => {
    test('should call GooglePayService "createButton" with proper values', async () => {
        const paymentsClient = mock<GooglePayService>();
        const onClickMock = jest.fn();
        paymentsClient.createButton.mockResolvedValue(document.createElement('div'));

        render(
            <GooglePayButton
                buttonColor={'default'}
                buttonType={'pay'}
                buttonSizeMode={'fill'}
                buttonLocale={'en-US'}
                onClick={onClickMock}
                paymentsClient={paymentsClient}
            />
        );

        await new Promise(process.nextTick);

        expect(paymentsClient.createButton).toHaveBeenCalledWith(
            expect.objectContaining({
                buttonColor: 'default',
                buttonLocale: 'en-US',
                buttonRootNode: undefined,
                buttonSizeMode: 'fill',
                buttonType: 'pay',
                onClick: expect.any(Function)
            })
        );
    });

    test('should forward "buttonRadius" to "createButton" when provided', async () => {
        const paymentsClient = mock<GooglePayService>();
        paymentsClient.createButton.mockResolvedValue(document.createElement('div'));

        render(
            <GooglePayButton
                buttonColor={'default'}
                buttonType={'pay'}
                buttonSizeMode={'fill'}
                buttonLocale={'en-US'}
                buttonRadius={4}
                onClick={jest.fn()}
                paymentsClient={paymentsClient}
            />
        );

        await new Promise(process.nextTick);

        expect(paymentsClient.createButton).toHaveBeenCalledWith(expect.objectContaining({ buttonRadius: 4 }));
    });

    test('should append the created button to the container', async () => {
        const paymentsClient = mock<GooglePayService>();
        const googleButton = document.createElement('div');
        googleButton.dataset.testid = 'google-created-button';
        paymentsClient.createButton.mockResolvedValue(googleButton);

        render(
            <GooglePayButton
                buttonColor={'default'}
                buttonType={'pay'}
                buttonSizeMode={'fill'}
                buttonLocale={'en-US'}
                onClick={jest.fn()}
                paymentsClient={paymentsClient}
            />
        );

        await new Promise(process.nextTick);

        expect(screen.getByTestId('googlepay-button-container')).toContainElement(screen.getByTestId('google-created-button'));
    });
});
