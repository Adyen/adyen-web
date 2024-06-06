import { get3DS2FlowProps } from '../../../components/ThreeDS2/components/utils';
import uuid from '../../../utils/uuid';
import type { PaymentAction } from '../../../types/global-types';
import type { IRegistry } from '../../core.registry';
import type { ICore } from '../../types';
import type { IUIElement } from '../../../components/internal/UIElement/types';

const createComponent = (core: ICore, registry: IRegistry, componentType, props): IUIElement => {
    const Element = registry.getComponent(componentType);

    if (!Element) {
        throw Error(`Action Element of type ${componentType} not found in the registry`);
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

        /**
         * NOTE: the isMDFlow prop comes from the options object, added within the MDFlow when it calls createFromAction(action, options) to initiate a 3DS2 component
         * It replaces the useOriginalFlow config prop that the MDFlow used to pass when directly initiating the threeDS2Fingerprint or threeDS2Challenge components
         */
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
            modules: {
                analytics: props.modules?.analytics,
                resources: props.modules?.resources
            },

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
