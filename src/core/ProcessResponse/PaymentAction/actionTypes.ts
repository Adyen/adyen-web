import { getComponent } from '~/components';
import { PaymentAction } from '~/types';

const actionTypes = {
    redirect: (action: PaymentAction, props) =>
        getComponent('redirect', {
            ...action,
            ...props,
            statusType: 'redirect'
        }),

    threeDS2Fingerprint: (action: PaymentAction, props) =>
        getComponent('threeDS2DeviceFingerprint', {
            createFromAction: props.createFromAction,
            fingerprintToken: action.token,
            paymentData: action.paymentData,
            onComplete: props.onAdditionalDetails,
            onError: props.onError,
            showSpinner: !props.isDropin,
            isDropin: !!props.isDropin,
            ...props,
            statusType: 'loading'
        }),

    threeDS2Challenge: (action: PaymentAction, props) =>
        getComponent('threeDS2Challenge', {
            ...props,
            challengeToken: action.token,
            paymentData: action.paymentData,
            onComplete: props.onAdditionalDetails,
            onError: props.onError,
            size: '05',
            isDropin: !!props.isDropin,
            statusType: 'custom'
        }),

    voucher: (action: PaymentAction, props) =>
        getComponent(action.paymentMethodType, {
            ...action,
            ...props,
            i18n: props.i18n,
            loadingContext: props.loadingContext,
            statusType: 'custom'
        }),

    qrCode: (action: PaymentAction, props) =>
        getComponent(action.paymentMethodType, {
            ...action,
            ...props,
            onComplete: props.onAdditionalDetails,
            onError: props.onError,
            statusType: 'custom'
        }),

    await: (action: PaymentAction, props) => {
        return getComponent(action.paymentMethodType, {
            ...action,
            ...props,
            onComplete: props.onAdditionalDetails,
            onError: props.onError,
            statusType: 'custom'
        });
    }
};

export default actionTypes;
