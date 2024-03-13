import { PaymentAction } from '../../../types/global-types';
import { get3DS2FlowProps } from '../../../components/ThreeDS2/components/utils';
import uuid from '../../../utils/uuid';
import type { IRegistry } from '../../core.registry';
import type { ICore } from '../../types';

const createComponent = (core: ICore, registry: IRegistry, componentType, props) => {
    const Element = registry.getComponent(componentType);

    if (!Element) {
        console.warn(`Action Element of type '${componentType}' not found in the registry`);
        return;
    }

    return new Element(core, { ...props, id: `${componentType}-${uuid()}` });
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

    threeDS2: (core: ICore, registry, action: PaymentAction, props) => {
        const componentType = action.subtype === 'fingerprint' ? 'threeDS2DeviceFingerprint' : 'threeDS2Challenge';

        const paymentData = action.subtype === 'fingerprint' || props.isMDFlow ? action.paymentData : action.authorisationToken;

        const config = {
            // Props common to both flows
            core: core,
            token: action.token,
            paymentData,
            onActionHandled: props.onActionHandled,
            onComplete: props.isMDFlow ? props.onComplete : props.onAdditionalDetails,
            onError: props.onError,
            isDropin: !!props.isDropin,
            loadingContext: props.loadingContext,
            clientKey: props.clientKey,
            paymentMethodType: props.paymentMethodType,
            challengeWindowSize: props.challengeWindowSize, // always pass challengeWindowSize in case it's been set directly in the handleAction config object
            isMDFlow: props.isMDFlow,
            modules: { analytics: props.modules?.analytics },

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
