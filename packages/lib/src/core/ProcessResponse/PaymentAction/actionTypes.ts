import { PaymentAction } from '../../../types';
import { get3DS2FlowProps } from '../../../components/ThreeDS2/components/utils';
import uuid from '../../../utils/uuid';
import type { IRegistry } from '../../core.registry';
import { ICore } from '../../types';

const createComponent = (core: ICore, registry: IRegistry, componentType, props) => {
    const Element = registry.getComponent(componentType);

    if (!Element) {
        console.warn(`Action Element of type '${componentType}' not found in the registry`);
        return;
    }

    return new Element({ core, ...props, id: `${componentType}-${uuid()}` });
};

const getActionHandler = statusType => {
    return (core: ICore, registry: IRegistry, action: PaymentAction, props) => {
        const config = {
            ...props,
            ...action,
            onComplete: props.onAdditionalDetails,
            onError: props.onError,
            statusType
        };

        return createComponent(core, registry, action.paymentMethodType, config);
    };
};

const actionTypes = {
    redirect: (core: ICore, registry, action: PaymentAction, props) => {
        const config = {
            ...props,
            ...action,
            statusType: 'redirect'
        };

        return createComponent(core, registry, 'redirect', config);
    },

    threeDS2Fingerprint: (core: ICore, registry, action: PaymentAction, props) => {
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
        return createComponent(core, registry, 'threeDS2DeviceFingerprint', config);
    },

    threeDS2Challenge: (core: ICore, registry, action: PaymentAction, props) => {
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
        return createComponent(core, registry, 'threeDS2Challenge', config);
    },

    threeDS2: (core: ICore, registry, action: PaymentAction, props) => {
        const componentType = action.subtype === 'fingerprint' ? 'threeDS2DeviceFingerprint' : 'threeDS2Challenge';
        const paymentData = action.subtype === 'fingerprint' ? action.paymentData : action.authorisationToken;

        const config = {
            // Props common to both flows
            core: core,
            token: action.token,
            paymentData,
            onActionHandled: props.onActionHandled,
            onComplete: props.onAdditionalDetails,
            onError: props.onError,
            isDropin: !!props.isDropin,
            loadingContext: props.loadingContext,
            clientKey: props.clientKey,
            paymentMethodType: props.paymentMethodType,
            challengeWindowSize: props.challengeWindowSize, // always pass challengeWindowSize in case it's been set directly in the handleAction config object

            // Props unique to a particular flow
            ...get3DS2FlowProps(action.subtype, props)
        };

        return createComponent(core, registry, componentType, config);
    },

    voucher: getActionHandler('custom'),
    qrCode: getActionHandler('custom'),
    await: getActionHandler('custom'),
    bankTransfer: getActionHandler('custom'),
    sdk: getActionHandler('custom')
} as const;

export default actionTypes;
