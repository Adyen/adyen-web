import { h } from 'preact';
import GooglePayButton from './GooglePayButton';
import { render } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';

describe('GooglePayButton', () => {
    test('should call Google "createButton" API with proper values', async () => {
        const googleClient = mock<google.payments.api.PaymentsClient>();
        const onClickMock = jest.fn();

        googleClient.createButton.mockImplementation(() => {
            const googleElement = document.createElement('div');
            return googleElement;
        });

        render(
            <GooglePayButton
                buttonColor={'default'}
                buttonType={'pay'}
                buttonSizeMode={'fill'}
                buttonLocale={'en-US'}
                onClick={onClickMock}
                paymentsClient={Promise.resolve(googleClient)}
            />
        );

        const flushPromises = () => new Promise(process.nextTick);
        await flushPromises();

        expect(googleClient.createButton).toHaveBeenCalledWith(
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
});
