import { get3DS2FlowProps } from '../../../components/ThreeDS2/components/utils';
import uuid from '../../../utils/uuid';
import UIElement from '../../../components/internal/UIElement';
import type { PaymentAction } from '../../../types/global-types';
import type { IRegistry } from '../../core.registry';
import { AdditionalDetailsData, ICore } from '../../types';

const createComponent = (core: ICore, registry: IRegistry, componentType, props): UIElement => {
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
            onComplete: (state: AdditionalDetailsData, component?: UIElement) => {
                if (component) {
                    // We use a type assertion to call the protected 'handleAdditionalDetails' method from the UIElement.
                    // This is safe because this is internal framework code.
                    (component as unknown as { handleAdditionalDetails: (state: AdditionalDetailsData) => void }).handleAdditionalDetails(state);
                } else {
                    core.submitDetails(state.data);
                }
            },
            onError: props.onError,
            statusType,
            originalAction: action
        };

        return createComponent(core, registry, action.paymentMethodType, config);
    };
};

const actionTypes = {
    redirect: (core: ICore, registry, action: PaymentAction, props) => {
        const config = {
            ...props,
            ...action,
            statusType: 'redirect',
            originalAction: action
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

        let mappedOnComplete: (state: any, component?: UIElement) => void = (state, component?: UIElement) =>
            (component as unknown as { handleAdditionalDetails: (state: AdditionalDetailsData) => void }).handleAdditionalDetails(state);

        if (props.isMDFlow) {
            /** In MDFlow we always want to finalise the 3DS2 flow by calling the passed onComplete function. (The MDFlow will then make any required, subsequent calls */
            mappedOnComplete = props.onComplete;
        }

        if (props.isDropin) {
            mappedOnComplete = (state: any) => {
                // If we were in a dropin, we need to call Dropin.handleAdditionalDetails
                props.elementRef.handleAdditionalDetails(state);
            };
        }

        const config = {
            // Props common to both flows
            core: core,
            token: action.token,
            paymentData,
            onActionHandled: props.onActionHandled,
            onComplete: mappedOnComplete,
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
