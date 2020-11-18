import { getComponent } from '../../../components';
import { PaymentAction } from '../../../types';
import { get3DS2FlowProps } from '../../../components/ThreeDS2/components/utils';

const actionTypes = {
    redirect: (action: PaymentAction, props) =>
        getComponent('redirect', {
            ...props,
            ...action,
            statusType: 'redirect'
        }),

    threeDS2Fingerprint: (action: PaymentAction, props) =>
        getComponent('threeDS2DeviceFingerprint', {
            createFromAction: props.createFromAction,
            token: action.token,
            paymentData: action.paymentData,
            onError: props.onError,
            showSpinner: !props.isDropin,
            isDropin: !!props.isDropin,
            ...props,
            type: 'IdentifyShopper',
            onComplete: props.onAdditionalDetails,
            statusType: 'loading'
        }),

    threeDS2Challenge: (action: PaymentAction, props) =>
        getComponent('threeDS2Challenge', {
            ...props,
            token: action.token,
            paymentData: action.paymentData,
            onComplete: props.onAdditionalDetails,
            onError: props.onError,
            size: '05',
            isDropin: !!props.isDropin,
            type: 'ChallengeShopper',
            statusType: 'custom'
        }),

    threeDS2: (action: PaymentAction, props) => {
        const componentType = action.subtype === 'fingerprint' ? 'threeDS2DeviceFingerprint' : 'threeDS2Challenge';

        const config = {
            // Props common to both flows
            token: action.token,
            paymentData: action.paymentData,
            onComplete: props.onAdditionalDetails,
            onError: props.onError,
            isDropin: !!props.isDropin,
            loadingContext: props.loadingContext,
            clientKey: props.clientKey,
            // Props unique to a particular flow
            ...get3DS2FlowProps(action.subtype, props)
        };

        return getComponent(componentType, config);
    },

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
