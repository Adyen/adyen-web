// import { getComponent } from '../../../components';
import { PaymentAction } from '../../../types';
import { get3DS2FlowProps } from '../../../components/ThreeDS2/components/utils';

const getActionHandler = statusType => (action: PaymentAction, props) => {
    // return getComponent(action.paymentMethodType, {
    //     ...props,
    //     ...action,
    //     onComplete: props.onAdditionalDetails,
    //     onError: props.onError,
    //     statusType
    // });
};

const actionTypes = {
    // redirect: (action: PaymentAction, props) =>
    //     getComponent('redirect', {
    //         ...props,
    //         ...action,
    //         statusType: 'redirect'
    //     }),
    //
    // threeDS2Fingerprint: (action: PaymentAction, props) =>
    //     getComponent('threeDS2DeviceFingerprint', {
    //         createFromAction: props.createFromAction,
    //         token: action.token,
    //         paymentData: action.paymentData,
    //         onError: props.onError,
    //         showSpinner: !props.isDropin,
    //         isDropin: !!props.isDropin,
    //         ...props,
    //         type: 'IdentifyShopper',
    //         onComplete: props.onAdditionalDetails,
    //         statusType: 'loading',
    //         useOriginalFlow: true
    //     }),
    //
    // threeDS2Challenge: (action: PaymentAction, props) => {
    //     return getComponent('threeDS2Challenge', {
    //         ...props,
    //         token: action.token,
    //         paymentData: action.paymentData,
    //         onComplete: props.onAdditionalDetails,
    //         onError: props.onError,
    //         size: props.size ?? '02',
    //         isDropin: !!props.isDropin,
    //         type: 'ChallengeShopper',
    //         statusType: 'custom',
    //         useOriginalFlow: true
    //     });
    // },
    //
    // threeDS2: (action: PaymentAction, props) => {
    //     const componentType = action.subtype === 'fingerprint' ? 'threeDS2DeviceFingerprint' : 'threeDS2Challenge';
    //     const paymentData = action.subtype === 'fingerprint' ? action.paymentData : action.authorisationToken;
    //
    //     const config = {
    //         // Props common to both flows
    //         token: action.token,
    //         paymentData,
    //         onActionHandled: props.onActionHandled,
    //         onComplete: props.onAdditionalDetails,
    //         onError: props.onError,
    //         isDropin: !!props.isDropin,
    //         loadingContext: props.loadingContext,
    //         clientKey: props.clientKey,
    //         _parentInstance: props._parentInstance,
    //         paymentMethodType: props.paymentMethodType,
    //         challengeWindowSize: props.challengeWindowSize, // always pass challengeWindowSize in case it's been set directly in the handleAction config object
    //
    //         // Props unique to a particular flow
    //         ...get3DS2FlowProps(action.subtype, props)
    //     };
    //
    //     return getComponent(componentType, config);
    // },
    //
    // voucher: getActionHandler('custom'),
    // qrCode: getActionHandler('custom'),
    // await: getActionHandler('custom'),
    // bankTransfer: getActionHandler('custom'),
    // sdk: getActionHandler('custom')
} as const;

export default actionTypes;
