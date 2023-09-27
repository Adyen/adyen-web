import { getComponentForAction } from './PaymentAction';
import { mockDeep } from 'jest-mock-extended';
import { ICore } from '../../types';
import registry from '../../core.registry';

const core = mockDeep<ICore>();

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
            const paymentResult = getComponentForAction(core, registry, redirectActionMock);

            expect(paymentResult.props.statusType).toBe('redirect');
            expect(paymentResult.constructor.type).toBe('redirect');
            expect(paymentResult.props.url).toBe(redirectActionMock.url);
        });

        test('processes a post redirect response', () => {
            const paymentResult = getComponentForAction(core, registry, redirectPostActionMock);

            expect(paymentResult.props.statusType).toBe('redirect');
            expect(paymentResult.constructor.type).toBe('redirect');
            expect(paymentResult.props.url).toBe(redirectPostActionMock.url);
            expect(paymentResult.props.data).toBe(redirectPostActionMock.data);
        });
    });

    describe.skip('ThreeDS2 old flow: with separate "threeDS2Fingerprint" & "threeDS2Challenge" actions', () => {
        const threeDS2FingerprintMock = { type: 'threeDS2Fingerprint', paymentMethodType: 'scheme', token: '...', paymentData: '...' };
        const threeDS2ChallengeMock = { type: 'threeDS2Challenge', paymentMethodType: 'scheme', token: '...', paymentData: '...' };

        test('processes an threeDS2Fingerprint action', () => {
            const paymentResult = getComponentForAction(core, registry, threeDS2FingerprintMock);

            expect(paymentResult.props.statusType).toBe('loading');
            expect(paymentResult.constructor.type).toBe('threeDS2Fingerprint');
            expect(paymentResult.props.isDropin).toBe(false);
        });

        test('processes an threeDS2Challenge response', () => {
            const paymentResult = getComponentForAction(core, registry, threeDS2ChallengeMock);

            expect(paymentResult.props.statusType).toBe('custom');
            expect(paymentResult.constructor.type).toBe('threeDS2Challenge');
            expect(paymentResult.props.isDropin).toBe(false);
        });

        test('processes an threeDS2Challenge response for Dropin', () => {
            const paymentResult = getComponentForAction(core, registry, threeDS2ChallengeMock, { isDropin: true });

            expect(paymentResult.props.statusType).toBe('custom');
            expect(paymentResult.constructor.type).toBe('threeDS2Challenge');
            expect(paymentResult.props.isDropin).toBe(true);
        });
    });
    //
    // describe('ThreeDS2 new flow: with one "threeDS2" action with subtypes', () => {
    //     const new3DS2FingerprintMock = { type: 'threeDS2', subtype: 'fingerprint', paymentMethodType: 'scheme', token: '...', paymentData: '...' };
    //     const new3DS2ChallengeMock = { type: 'threeDS2', subtype: 'challenge', paymentMethodType: 'scheme', token: '...', paymentData: '...' };
    //
    //     const mockCoreProps = { onAdditionalDetails: () => {}, challengeWindowSize: '02' };
    //     const mockDropinProps = { elementRef: {}, isDropin: true, challengeWindowSize: '02' };
    //
    //     test('processes a new threeDS2Fingerprint action initiated from Card component', () => {
    //         const paymentResult = getComponentForAction(new3DS2FingerprintMock, mockCoreProps);
    //
    //         expect(paymentResult.props.statusType).toEqual('loading');
    //         expect(paymentResult.constructor.type).toEqual('threeDS2Fingerprint');
    //         expect(paymentResult.props.isDropin).toBe(false);
    //         expect(paymentResult.props.showSpinner).toBe(true);
    //         expect(typeof paymentResult.props.onAdditionalDetails).toEqual('function');
    //     });
    //
    //     test('processes a new threeDS2Fingerprint action initiated from Dropin', () => {
    //         const paymentResult = getComponentForAction(new3DS2FingerprintMock, mockDropinProps);
    //
    //         expect(paymentResult.props.statusType).toEqual('loading');
    //         expect(paymentResult.constructor.type).toEqual('threeDS2Fingerprint');
    //         expect(paymentResult.props.isDropin).toBe(true);
    //         expect(paymentResult.props.showSpinner).toBe(false);
    //         expect(typeof paymentResult.props.onAdditionalDetails).toEqual('undefined');
    //         expect(paymentResult.props.elementRef).not.toEqual('undefined');
    //     });
    //
    //     test('processes a new threeDS2Challenge action initiated from Card component', () => {
    //         const paymentResult = getComponentForAction(new3DS2ChallengeMock, mockCoreProps);
    //
    //         expect(paymentResult.props.statusType).toEqual('custom');
    //         expect(paymentResult.constructor.type).toEqual('threeDS2Challenge');
    //         expect(paymentResult.props.isDropin).toBe(false);
    //         expect(paymentResult.props.showSpinner).toBe(undefined);
    //         expect(paymentResult.props.challengeWindowSize).toEqual('02');
    //     });
    //
    //     test('processes a new threeDS2Challenge action initiated from Dropin', () => {
    //         const paymentResult = getComponentForAction(new3DS2ChallengeMock, mockDropinProps);
    //
    //         expect(paymentResult.props.statusType).toEqual('custom');
    //         expect(paymentResult.constructor.type).toEqual('threeDS2Challenge');
    //         expect(paymentResult.props.isDropin).toBe(true);
    //         expect(paymentResult.props.showSpinner).toBe(undefined);
    //         expect(paymentResult.props.challengeWindowSize).toEqual('02');
    //     });
    // });
    //
    // describe('QRCode', () => {
    //     const paymentData = 'Ab02b4c0!BQABAgA20TqlJow';
    //     const bcmcMock = {
    //         paymentMethodType: 'bcmc_mobile_QR',
    //         qrCodeData: 'BEP://1127.0.0.1$2B6VH2NNUBHGDIF3KHNQ3JRK',
    //         type: 'qrCode'
    //     };
    //
    //     test('processes a qrCode action for bcmc_mobile', () => {
    //         const paymentResult = getComponentForAction(bcmcMock, { loadingContext: '', paymentData });
    //
    //         expect(paymentResult.props.statusType).toBe('custom');
    //         expect(paymentResult.constructor.type).toBe('bcmc_mobile');
    //     });
    //
    //     const weChatMock = {
    //         paymentMethodType: 'wechatpayQR',
    //         qrCodeData: 'BEP://1127.0.0.1$2B6VH2NNUBHGDIF3KHNQ3JRK',
    //         type: 'qrCode'
    //     };
    //
    //     test('processes a qrCode action for wechatpayQR', () => {
    //         const paymentResult = getComponentForAction(weChatMock, { loadingContext: '', paymentData });
    //
    //         expect(paymentResult.props.statusType).toBe('custom');
    //         expect(paymentResult.constructor.type).toBe('wechatpayQR');
    //     });
    // });
    //
    // describe('Voucher', () => {
    //     const boletoVoucherMock = {
    //         paymentMethodType: 'boletobancario_santander',
    //         downloadUrl: 'https://...',
    //         expiresAt: '2020-02-12T00:00:00',
    //         initialAmount: {
    //             currency: 'BRL',
    //             value: 1000
    //         },
    //         reference: '03399.37473 12342.547284 85272.394939 1 81630000001000',
    //         totalAmount: {
    //             currency: 'BRL',
    //             value: 1000
    //         },
    //         type: 'voucher'
    //     };
    //
    //     test('processes a voucher action for boletobancario_santander', () => {
    //         const paymentResult = getComponentForAction(boletoVoucherMock, { loadingContext: '' });
    //
    //         expect(paymentResult.props.statusType).toBe('custom');
    //         expect(paymentResult.constructor.type).toBe('boletobancario');
    //     });
    // });
    //
    // describe('Error', () => {
    //     test('processes an incorrect action ', () => {
    //         expect(() => getComponentForAction({ type: 'test', paymentMethodType: 'test' }, { loadingContext: '' })).toThrow();
    //     });
    // });
});
