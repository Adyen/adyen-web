import { PaymentAction } from '../../../types';
import { get3DS2FlowProps } from '../../../components/ThreeDS2/components/utils';
import uuid from '../../../utils/uuid';
import type { IRegistry } from '../../core.registry';

const createComponent = (checkout, registry: IRegistry, componentType, props) => {
    const Element = registry.getComponent(componentType);
    return new Element(checkout, { ...props, id: `${componentType}-${uuid()}` });
};

const getActionHandler = statusType => (checkout, registry: IRegistry, action: PaymentAction, props) => {
    const config = {
        ...props,
        ...action,
        onComplete: props.onAdditionalDetails,
        onError: props.onError,
        statusType
    };

    return createComponent(checkout, registry, action.paymentMethodType, config);
};

const actionTypes = {
    redirect: (checkout, registry, action: PaymentAction, props) => {
        const config = {
            ...props,
            ...action,
            statusType: 'redirect'
        };

        return createComponent(checkout, registry, 'redirect', config);
    },

    threeDS2Fingerprint: (checkout, registry, action: PaymentAction, props) => {
        const config = {
            createFromAction: props.createFromAction,
            token: action.token,
            paymentData: action.paymentData,
            onError: props.onError,
            showSpinner: !props.isDropin,
            isDropin: !!props.isDropin,
            ...props,
            type: 'IdentifyShopper',
            onComplete: props.onAdditionalDetails,
            statusType: 'loading',
            useOriginalFlow: true
        };

        return createComponent(checkout, registry, 'threeDS2DeviceFingerprint', config);
    },

    threeDS2Challenge: (checkout, registry, action: PaymentAction, props) => {
        const config = {
            ...props,
            token: action.token,
            paymentData: action.paymentData,
            onComplete: props.onAdditionalDetails,
            onError: props.onError,
            size: props.size ?? '02',
            isDropin: !!props.isDropin,
            type: 'ChallengeShopper',
            statusType: 'custom',
            useOriginalFlow: true
        };

        return createComponent(checkout, registry, 'threeDS2Challenge', config);
    },

    threeDS2: (checkout, registry, action: PaymentAction, props) => {
        const componentType = action.subtype === 'fingerprint' ? 'threeDS2DeviceFingerprint' : 'threeDS2Challenge';
        const paymentData = action.subtype === 'fingerprint' ? action.paymentData : action.authorisationToken;

        const config = {
            // Props common to both flows
            token: action.token,
            paymentData,
            onActionHandled: props.onActionHandled,
            onComplete: props.onAdditionalDetails,
            onError: props.onError,
            isDropin: !!props.isDropin,
            loadingContext: props.loadingContext,
            clientKey: props.clientKey,
            _parentInstance: props._parentInstance,
            paymentMethodType: props.paymentMethodType,
            challengeWindowSize: props.challengeWindowSize, // always pass challengeWindowSize in case it's been set directly in the handleAction config object

            // Props unique to a particular flow
            ...get3DS2FlowProps(action.subtype, props)
        };

        return createComponent(checkout, registry, componentType, config);
    },

    voucher: getActionHandler('custom'),
    qrCode: getActionHandler('custom'),
    await: getActionHandler('custom'),
    bankTransfer: getActionHandler('custom'),
    sdk: getActionHandler('custom')
} as const;

export default actionTypes;
