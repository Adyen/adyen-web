import { mock } from 'jest-mock-extended';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

import { ClickToPayElement } from './ClickToPay';
import { ClickToPayProps } from '../internal/ClickToPay/types';
import createClickToPayService from '../internal/ClickToPay/services/create-clicktopay-service';
import { ClickToPayCheckoutPayload, IClickToPayService } from '../internal/ClickToPay/services/types';
import { CtpState } from '../internal/ClickToPay/services/ClickToPayService';
import { Resources } from '../../core/Context/Resources';
import ShopperCard from '../internal/ClickToPay/models/ShopperCard';

jest.mock('../internal/ClickToPay/services/create-clicktopay-service');

test('should initialize ClickToPayService when creating the element', () => {
    const mockCtpService = mock<IClickToPayService>();
    mockCtpService.initialize.mockImplementation(() => Promise.resolve());
    // @ts-ignore mockImplementation not inferred
    createClickToPayService.mockImplementationOnce(() => mockCtpService);

    const configuration = {
        visaSrcInitiatorId: '$123456$',
        visaSrciDpaId: '$654321$'
    };
    const ctpConfiguration: ClickToPayProps = {
        shopperEmail: 'shopper@example.com'
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const element = new ClickToPayElement(global.core, { environment: 'test', configuration, ...ctpConfiguration });

    expect(createClickToPayService).toHaveBeenCalledWith(configuration, ctpConfiguration, 'test');
    expect(mockCtpService.initialize).toHaveBeenCalledTimes(1);
});

test('should formatData() to click to pay /payment request format', () => {
    const paymentDataReceivedFromScheme: ClickToPayCheckoutPayload = {
        srcDigitalCardId: '$123456$',
        srcCorrelationId: '$654321$',
        srcScheme: 'mc'
    };

    const element = new ClickToPayElement(global.core);
    element.setState({ data: paymentDataReceivedFromScheme });

    const data = element.formatData();

    expect(data).toEqual(
        expect.objectContaining({
            paymentMethod: {
                type: 'clicktopay',
                srcDigitalCardId: paymentDataReceivedFromScheme.srcDigitalCardId,
                srcCorrelationId: paymentDataReceivedFromScheme.srcCorrelationId,
                srcScheme: paymentDataReceivedFromScheme.srcScheme
            }
        })
    );
    expect(data.browserInfo).toBeDefined();
    expect(data.origin).toBeDefined();
});

test('should get shopperEmail from session if available', () => {
    global.core.options = {
        session: {
            shopperEmail: 'shopper@example.com'
        }
    };

    const element = new ClickToPayElement(global.core);

    expect(element.props.shopperEmail).toBe('shopper@example.com');
});

test('should resolve isAvailable if shopper account is found', async () => {
    const mockCtpService = mock<IClickToPayService>();
    mockCtpService.initialize.mockImplementation(() => Promise.resolve());
    // @ts-ignore mockImplementation not inferred
    createClickToPayService.mockImplementationOnce(() => mockCtpService);

    Object.defineProperty(mockCtpService, 'shopperAccountFound', {
        get: jest.fn(() => true)
    });

    const element = new ClickToPayElement(global.core);

    await expect(element.isAvailable()).resolves.not.toThrow();
});

test('should reject isAvailable if shopper account is not found', async () => {
    const mockCtpService = mock<IClickToPayService>();
    mockCtpService.initialize.mockImplementation(() => Promise.resolve());
    // @ts-ignore mockImplementation not inferred
    createClickToPayService.mockImplementationOnce(() => mockCtpService);

    mockCtpService.subscribeOnStateChange.mockImplementation(callback => {
        callback(CtpState.NotAvailable);
    });

    Object.defineProperty(mockCtpService, 'shopperAccountFound', {
        get: jest.fn(() => false)
    });

    const element = new ClickToPayElement(global.core);

    await expect(element.isAvailable()).rejects.toBeFalsy();
});

describe('Click to Pay: ENTER keypress should perform an action only within the CtP Component and should not propagate the event up to UIElement', () => {
    test('[Login form] should trigger shopper email lookup when ENTER key is pressed', async () => {
        const user = userEvent.setup();

        const mockCtpService = mock<IClickToPayService>();
        mockCtpService.initialize.mockImplementation(() => Promise.resolve());
        mockCtpService.schemes = ['visa', 'mc'];
        mockCtpService.verifyIfShopperIsEnrolled.mockResolvedValue({ isEnrolled: false });
        mockCtpService.initialize.mockImplementation(() => Promise.resolve());
        mockCtpService.subscribeOnStateChange.mockImplementation(callback => {
            callback(CtpState.Login);
        });

        // @ts-ignore mockImplementation not inferred
        createClickToPayService.mockImplementation(() => mockCtpService);

        const resources = mock<Resources>();
        resources.getImage.mockReturnValue((icon: string) => `https://checkout-adyen.com/${icon}`);

        const onSubmitMock = jest.fn();

        const element = new ClickToPayElement(global.core, {
            onSubmit: onSubmitMock,
            loadingContext: 'checkoutshopper.com/',
            modules: { resources, analytics: global.analytics },
            i18n: global.i18n
        });
        render(element.mount('body'));

        const emailInput = await screen.findByLabelText('Email');
        await user.type(emailInput, 'shopper@example.com');
        await user.keyboard('[Enter]');

        expect(mockCtpService.verifyIfShopperIsEnrolled).toHaveBeenCalledTimes(1);
        expect(mockCtpService.verifyIfShopperIsEnrolled).toHaveBeenCalledWith({ shopperEmail: 'shopper@example.com' });
        expect(onSubmitMock).not.toHaveBeenCalled();

        element.unmount();
    });

    test('[OTP form] should trigger OTP validation when ENTER key is pressed', async () => {
        const user = userEvent.setup();

        const mockCtpService = mock<IClickToPayService>();
        mockCtpService.initialize.mockImplementation(() => Promise.resolve());
        mockCtpService.schemes = ['visa', 'mc'];
        mockCtpService.finishIdentityValidation.mockResolvedValue();
        mockCtpService.initialize.mockImplementation(() => Promise.resolve());
        mockCtpService.subscribeOnStateChange.mockImplementation(callback => {
            callback(CtpState.OneTimePassword);
        });

        // @ts-ignore mockImplementation not inferred
        createClickToPayService.mockImplementation(() => mockCtpService);

        const resources = mock<Resources>();
        resources.getImage.mockReturnValue((icon: string) => `https://checkout-adyen.com/${icon}`);

        const onSubmitMock = jest.fn();

        const element = new ClickToPayElement(global.core, {
            onSubmit: onSubmitMock,
            loadingContext: 'checkoutshopper.com/',
            modules: { resources, analytics: global.analytics },
            i18n: global.i18n
        });
        render(element.mount('body'));

        const emailInput = await screen.findByLabelText('One time code', { exact: false });
        await user.type(emailInput, '654321');
        await user.keyboard('[Enter]');

        expect(mockCtpService.finishIdentityValidation).toHaveBeenCalledTimes(1);
        expect(mockCtpService.finishIdentityValidation).toHaveBeenCalledWith('654321');
        expect(onSubmitMock).not.toHaveBeenCalled();

        element.unmount();
    });

    test('[Card view] should trigger Click to Pay checkout when ENTER key is pressed', async () => {
        const user = userEvent.setup();

        const mockCtpService = mock<IClickToPayService>();
        mockCtpService.initialize.mockImplementation(() => Promise.resolve());
        mockCtpService.schemes = ['visa', 'mc'];
        mockCtpService.subscribeOnStateChange.mockImplementation(callback => {
            callback(CtpState.Ready);
        });
        mockCtpService.shopperCards = [
            new ShopperCard(
                {
                    srcDigitalCardId: '654321',
                    panLastFour: '8902',
                    dateOfCardCreated: '2015-10-10T09:15:00.312Z',
                    dateOfCardLastUsed: '2020-05-28T08:10:02.312Z',
                    paymentCardDescriptor: 'visa',
                    panExpirationMonth: '08',
                    panExpirationYear: '2040',
                    digitalCardData: {
                        descriptorName: 'Visa',
                        artUri: 'http://image.com/visa',
                        status: 'ACTIVE'
                    },
                    tokenId: 'xxxx-wwww'
                },
                'visa',
                '1234566'
            )
        ];
        mockCtpService.checkout.mockRejectedValue({});

        // @ts-ignore mockImplementation not inferred by Typescript
        createClickToPayService.mockImplementation(() => mockCtpService);

        const resources = mock<Resources>();
        resources.getImage.mockReturnValue((icon: string) => `https://checkout-adyen.com/${icon}`);

        const onSubmitMock = jest.fn();

        const element = new ClickToPayElement(global.core, {
            onSubmit: onSubmitMock,
            loadingContext: 'checkoutshopper.com/',
            modules: { resources, analytics: global.analytics },
            i18n: global.i18n
        });
        render(element.mount('body'));

        const button = await screen.findByRole('button', { name: /Pay/ });

        // Focus on the Pay button
        await user.tab();
        await user.tab();
        expect(button).toHaveFocus();

        await user.keyboard('[Enter]');

        expect(mockCtpService.checkout).toHaveBeenCalledTimes(1);
        expect(mockCtpService.checkout).toHaveBeenCalledWith(mockCtpService.shopperCards[0]);
        expect(onSubmitMock).not.toHaveBeenCalled();

        element.unmount();
    });
});
