import { CardElement } from './Card';
import Analytics from '../../core/Analytics';

const analyticsModule = Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '', bundleType: 'umd' });

let card;
let analyticsEventObject;

import {
    ANALYTICS_CONFIGURED_STR,
    ANALYTICS_EVENT,
    ANALYTICS_FOCUS_STR,
    ANALYTICS_RENDERED_STR,
    ANALYTICS_SUBMIT_STR,
    ANALYTICS_UNFOCUS_STR,
    ANALYTICS_VALIDATION_ERROR_STR
} from '../../core/Analytics/constants';
import { SF_ErrorCodes } from '../../core/Errors/constants';

describe('Card: calls that generate "info" analytics should produce objects with the expected shapes ', () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});

        card = new CardElement(global.core, {
            modules: {
                analytics: analyticsModule
            }
        });

        analyticsEventObject = null;

        // @ts-ignore it's a test
        analyticsModule.createAnalyticsEvent = jest.fn(aObj => {
            analyticsEventObject = aObj;
        });
    });

    test('Analytics should produce an "info" event, of type "rendered", for a card PM', () => {
        card.submitAnalytics({
            type: ANALYTICS_RENDERED_STR
        });

        // configData is too complex an object to fully inspect - but expect it to be there
        expect(analyticsEventObject.data.configData).toBeDefined();
        delete analyticsEventObject.data.configData;

        // With configData removed inspect what's left
        expect(analyticsEventObject).toEqual({
            event: ANALYTICS_EVENT.info,
            data: { component: card.constructor['type'], type: ANALYTICS_RENDERED_STR }
        });
    });

    test('Analytics should produce an "info" event, of type "rendered", for a storedCard PM', () => {
        card.submitAnalytics({
            type: ANALYTICS_RENDERED_STR,
            isStoredPaymentMethod: true,
            brand: 'mc'
        });

        // configData is too complex an object to fully inspect - but expect it to be there
        expect(analyticsEventObject.data.configData).toBeDefined();
        delete analyticsEventObject.data.configData;

        // With configData removed inspect what's left
        expect(analyticsEventObject).toEqual({
            event: ANALYTICS_EVENT.info,
            data: { component: card.constructor['type'], type: ANALYTICS_RENDERED_STR, isStoredPaymentMethod: true, brand: 'mc' }
        });
    });

    test('Analytics should produce an "info" event, of type "configured", for a card PM', () => {
        card.submitAnalytics({
            type: ANALYTICS_CONFIGURED_STR
        });

        expect(analyticsModule.createAnalyticsEvent).toHaveBeenCalledWith({
            event: ANALYTICS_EVENT.info,
            data: { component: card.constructor['type'], type: ANALYTICS_CONFIGURED_STR }
        });
    });

    test('Analytics should produce an "info" event, of type "configured", for a storedCard PM', () => {
        card.submitAnalytics({
            type: ANALYTICS_CONFIGURED_STR,
            isStoredPaymentMethod: true,
            brand: 'mc'
        });

        expect(analyticsModule.createAnalyticsEvent).toHaveBeenCalledWith({
            event: ANALYTICS_EVENT.info,
            data: { component: card.constructor['type'], type: ANALYTICS_CONFIGURED_STR, isStoredPaymentMethod: true, brand: 'mc' }
        });
    });

    test('Analytics should produce an "info" event, of type "focus" with the target value correctly formed', () => {
        card.onFocus({
            fieldType: 'encryptedCardNumber',
            event: {
                action: 'focus',
                focus: true,
                numChars: 0,
                fieldType: 'encryptedCardNumber',
                rootNode: {},
                type: 'card',
                currentFocusObject: 'encryptedCardNumber'
            }
        });

        expect(analyticsModule.createAnalyticsEvent).toHaveBeenCalledWith({
            event: ANALYTICS_EVENT.info,
            data: { component: card.constructor['type'], type: ANALYTICS_FOCUS_STR, target: 'card_number' }
        });
    });

    test('Analytics should produce an "info" event, of type "unfocus" with the target value correctly formed', () => {
        card.onBlur({
            fieldType: 'encryptedCardNumber',
            event: {
                action: 'focus',
                focus: false,
                numChars: 1,
                fieldType: 'encryptedCardNumber',
                rootNode: {},
                type: 'card',
                currentFocusObject: null
            }
        });

        expect(analyticsModule.createAnalyticsEvent).toHaveBeenCalledWith({
            event: ANALYTICS_EVENT.info,
            data: { component: card.constructor['type'], type: ANALYTICS_UNFOCUS_STR, target: 'card_number' }
        });
    });

    test('Analytics should produce an "info" event, of type "validationError", with the expected properties', () => {
        card.onValidationErrorAnalytics({
            fieldType: 'encryptedCardNumber',
            errorCode: SF_ErrorCodes.ERROR_MSG_INCORRECTLY_FILLED_PAN
        });

        expect(analyticsModule.createAnalyticsEvent).toHaveBeenCalledWith({
            event: ANALYTICS_EVENT.info,
            data: {
                component: card.constructor['type'],
                type: ANALYTICS_VALIDATION_ERROR_STR,
                target: 'card_number',
                validationErrorCode: SF_ErrorCodes.ERROR_MSG_INCORRECTLY_FILLED_PAN,
                validationErrorMessage: 'error-msg-incorrectly-filled-pan'
            }
        });
    });
});

describe('Card: calls that generate "log" analytics should produce objects with the expected shapes ', () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});

        card = new CardElement(global.core, {
            modules: {
                analytics: analyticsModule
            }
        });

        analyticsModule.createAnalyticsEvent = jest.fn(() => null);
    });

    test('Analytics should produce an "log" event, of type "submit", for a card PM', () => {
        card.submitAnalytics({ type: ANALYTICS_SUBMIT_STR });

        expect(analyticsModule.createAnalyticsEvent).toHaveBeenCalledWith({
            event: ANALYTICS_EVENT.log,
            data: {
                component: card.constructor['type'],
                type: ANALYTICS_SUBMIT_STR,
                message: 'Shopper clicked pay'
            }
        });
    });
});
