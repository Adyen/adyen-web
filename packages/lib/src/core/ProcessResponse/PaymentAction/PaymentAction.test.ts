import { getComponentForAction } from './PaymentAction';
import registry from '../../core.registry';
import BoletoElement from '../../../components/Boleto';
import { BcmcMobile, Redirect, WeChat } from '../../../components';
import ThreeDS2DeviceFingerprint from '../../../components/ThreeDS2/ThreeDS2DeviceFingerprint';
import ThreeDS2Challenge from '../../../components/ThreeDS2/ThreeDS2Challenge';

describe('getComponentForAction', () => {
    describe('redirect', () => {
        const redirectActionMock = {
            method: 'GET',
            paymentMethodType: 'ideal',
            type: 'redirect',
            url: 'http://localhost:8080/hpp/redirectIdeal.shtml?brandCode=ideal&countryCode=NL¤cyCode=EUR&issuerId=1121&merchantAccount=TestMerchant&merchantIntegration.type=CHECKOUT_GENERIC&merchantIntegration.version=49&merchantReference=8&merchantReturnData=991558707124405K&merchantSig=g1KlViuS0JSr%2Fl9ah1uC4dpYjpn9T%2FvB7dAwHn81sdA%3D&paymentAmount=250&recurringContract=RECURRING&resURL=http%3A%2F%2Flocalhost%3A8080%2Fcheckoutshopper%2Fservices%2FPaymentIncomingRedirect%2Fv1%2FlocalPaymentMethod%3FmerchantAccount%3DTestMerchant%26returnURL%3Dapp%253A%252F%252Fyou&sessionValidity=2019-05-24T15%3A12%3A04Z&shopperReference=emred&skinCode=pub.v2.9915585372919700.W8YBZHHDHqOtHZK8ZC-X7_n9x1N3opO8Wbc_MQlh2IU'
        };

        const redirectPostActionMock = {
            method: 'POST',
            paymentMethodType: 'ideal',
            type: 'redirect',
            data: {
                test: '123'
            },
            url: 'http://localhost:8080/hpp/redirectIdeal.shtml?brandCode=ideal&countryCode=NL¤cyCode=EUR&issuerId=1121&merchantAccount=TestMerchant&merchantIntegration.type=CHECKOUT_GENERIC&merchantIntegration.version=49&merchantReference=8&merchantReturnData=991558707124405K&merchantSig=g1KlViuS0JSr%2Fl9ah1uC4dpYjpn9T%2FvB7dAwHn81sdA%3D&paymentAmount=250&recurringContract=RECURRING&resURL=http%3A%2F%2Flocalhost%3A8080%2Fcheckoutshopper%2Fservices%2FPaymentIncomingRedirect%2Fv1%2FlocalPaymentMethod%3FmerchantAccount%3DTestMerchant%26returnURL%3Dapp%253A%252F%252Fyou&sessionValidity=2019-05-24T15%3A12%3A04Z&shopperReference=emred&skinCode=pub.v2.9915585372919700.W8YBZHHDHqOtHZK8ZC-X7_n9x1N3opO8Wbc_MQlh2IU'
        };

        test('processes a redirect response', () => {
            const paymentResult = getComponentForAction(global.core, registry, redirectActionMock) as Redirect;

            expect(paymentResult.props.statusType).toBe('redirect');
            expect(paymentResult.type).toBe('redirect');
            expect(paymentResult.props.url).toBe(redirectActionMock.url);
        });

        test('processes a post redirect response', () => {
            const paymentResult = getComponentForAction(global.core, registry, redirectPostActionMock) as Redirect;

            expect(paymentResult.props.statusType).toBe('redirect');
            expect(paymentResult.type).toBe('redirect');
            expect(paymentResult.props.url).toBe(redirectPostActionMock.url);
            expect(paymentResult.props.data).toBe(redirectPostActionMock.data);
        });
    });

    describe('ThreeDS2: with one "threeDS2" action with subtypes', () => {
        const new3DS2FingerprintMock = { type: 'threeDS2', subtype: 'fingerprint', paymentMethodType: 'scheme', token: '...', paymentData: '...' };
        const new3DS2ChallengeMock = { type: 'threeDS2', subtype: 'challenge', paymentMethodType: 'scheme', token: '...', paymentData: '...' };

        const mockCoreProps = { onAdditionalDetails: () => {}, challengeWindowSize: '02' };
        const mockDropinProps = { elementRef: {}, isDropin: true, challengeWindowSize: '02' };

        test('processes a new threeDS2Fingerprint action initiated from Card component', () => {
            const paymentResult = getComponentForAction(global.core, registry, new3DS2FingerprintMock, mockCoreProps) as ThreeDS2DeviceFingerprint;

            expect(paymentResult.props.statusType).toEqual('loading');
            expect(paymentResult.type).toEqual('threeDS2Fingerprint');
            expect(paymentResult.props.isDropin).toBe(false);
            expect(paymentResult.props.showSpinner).toBe(true);
            expect(typeof paymentResult.props.onAdditionalDetails).toEqual('function');
        });

        test('processes a new threeDS2Fingerprint action initiated from Dropin', () => {
            const paymentResult = getComponentForAction(global.core, registry, new3DS2FingerprintMock, mockDropinProps) as ThreeDS2DeviceFingerprint;

            expect(paymentResult.props.statusType).toEqual('loading');
            expect(paymentResult.type).toEqual('threeDS2Fingerprint');
            expect(paymentResult.props.isDropin).toBe(true);
            expect(paymentResult.props.showSpinner).toBe(false);
            expect(typeof paymentResult.props.onAdditionalDetails).toEqual('undefined');
            expect(paymentResult.props.elementRef).not.toEqual('undefined');
        });

        test('processes a new threeDS2Challenge action initiated from Card component', () => {
            const paymentResult = getComponentForAction(global.core, registry, new3DS2ChallengeMock, mockCoreProps) as ThreeDS2Challenge;

            expect(paymentResult.props.statusType).toEqual('custom');
            expect(paymentResult.type).toEqual('threeDS2Challenge');
            expect(paymentResult.props.isDropin).toBe(false);
            expect(paymentResult.props.challengeWindowSize).toEqual('02');
            // @ts-ignore showSpinner should be undefined for threeDS2Challenge
            expect(paymentResult.props.showSpinner).toBe(undefined);
        });

        test('processes a new threeDS2Challenge action initiated from Dropin', () => {
            const paymentResult = getComponentForAction(global.core, registry, new3DS2ChallengeMock, mockDropinProps) as ThreeDS2Challenge;

            expect(paymentResult.props.statusType).toEqual('custom');
            expect(paymentResult.type).toEqual('threeDS2Challenge');
            expect(paymentResult.props.isDropin).toBe(true);
            expect(paymentResult.props.challengeWindowSize).toEqual('02');
            // @ts-ignore showSpinner should be undefined for threeDS2Challenge
            expect(paymentResult.props.showSpinner).toBe(undefined);
        });
    });

    describe('QRCode', () => {
        const paymentData = 'Ab02b4c0!BQABAgA20TqlJow';

        test('processes a qrCode action for bcmc_mobile', () => {
            const bcmcMock = {
                paymentMethodType: 'bcmc_mobile_QR',
                qrCodeData: 'BEP://1127.0.0.1$2B6VH2NNUBHGDIF3KHNQ3JRK',
                type: 'qrCode'
            };

            registry.add(BcmcMobile);
            const paymentResult = getComponentForAction(global.core, registry, bcmcMock, { loadingContext: '', paymentData });

            expect(paymentResult.props.statusType).toBe('custom');
            // @ts-ignore Accessing the UIElement static type
            expect(paymentResult.constructor.type).toBe('bcmc_mobile');
        });

        test('processes a qrCode action for wechatpay', () => {
            const weChatMock = {
                paymentMethodType: 'wechatpayQR',
                qrCodeData: 'BEP://1127.0.0.1$2B6VH2NNUBHGDIF3KHNQ3JRK',
                type: 'qrCode'
            };

            registry.add(WeChat);
            const paymentResult = getComponentForAction(global.core, registry, weChatMock, { loadingContext: '', paymentData });
            expect(paymentResult.props.statusType).toBe('custom');
            // @ts-ignore Accessing the UIElement static type
            expect(paymentResult.constructor.type).toBe('wechatpayQR');
        });
    });

    describe('Voucher', () => {
        const boletoVoucherMock = {
            paymentMethodType: 'boletobancario_santander',
            downloadUrl: 'https://...',
            expiresAt: '2020-02-12T00:00:00',
            initialAmount: {
                currency: 'BRL',
                value: 1000
            },
            reference: '03399.37473 12342.547284 85272.394939 1 81630000001000',
            totalAmount: {
                currency: 'BRL',
                value: 1000
            },
            type: 'voucher'
        };

        test('processes a voucher action for boletobancario_santander', () => {
            registry.add(BoletoElement);
            const paymentResult = getComponentForAction(global.core, registry, boletoVoucherMock, { loadingContext: '' });
            expect(paymentResult.props.statusType).toBe('custom');
            // @ts-ignore Accessing the UIElement static type
            expect(paymentResult.constructor.type).toBe('boletobancario');
        });
    });

    describe('Error', () => {
        test('processes an incorrect action ', () => {
            expect(() => getComponentForAction(global.core, registry, { type: 'test', paymentMethodType: 'test' })).toThrow();
        });
    });
});
