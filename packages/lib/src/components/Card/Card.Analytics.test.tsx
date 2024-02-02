import { CardElement } from './Card';
import Analytics from '../../core/Analytics';

const analyticsModule = Analytics({ analytics: {}, loadingContext: '', locale: '', clientKey: '' });

let card;

import {
    ANALYTICS_CONFIGURED_STR,
    ANALYTICS_EVENT_INFO,
    ANALYTICS_EVENT_LOG,
    ANALYTICS_FOCUS_STR,
    ANALYTICS_RENDERED_STR,
    ANALYTICS_SUBMIT_STR,
    ANALYTICS_UNFOCUS_STR,
    ANALYTICS_VALIDATION_ERROR_STR
} from '../../core/Analytics/constants';

describe('Card: calls that generate "info" analytics should produce objects with the expected shapes ', () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});

        card = new CardElement({
            core: null,
            modules: {
                analytics: analyticsModule
            }
        });

        analyticsModule.createAnalyticsEvent = jest.fn(obj => {
            console.log('### analyticsPreProcessor.test:::: obj=', obj);
        });
    });

    test('Analytics should produce an "info" event, of type "rendered", for a card PM', () => {
        card.submitAnalytics({
            type: ANALYTICS_RENDERED_STR
        });

        expect(analyticsModule.createAnalyticsEvent).toHaveBeenCalledWith({
            event: ANALYTICS_EVENT_INFO,
            data: { component: card.constructor['type'], type: ANALYTICS_RENDERED_STR }
        });
    });

    test('Analytics should produce an "info" event, of type "rendered", for a storedCard PM', () => {
        card.submitAnalytics({
            type: ANALYTICS_RENDERED_STR,
            isStoredPaymentMethod: true,
            brand: 'mc'
        });

        expect(analyticsModule.createAnalyticsEvent).toHaveBeenCalledWith({
            event: ANALYTICS_EVENT_INFO,
            data: { component: card.constructor['type'], type: ANALYTICS_RENDERED_STR, isStoredPaymentMethod: true, brand: 'mc' }
        });
    });

    test('Analytics should produce an "info" event, of type "configured", for a card PM', () => {
        card.submitAnalytics({
            type: ANALYTICS_CONFIGURED_STR
        });

        expect(analyticsModule.createAnalyticsEvent).toHaveBeenCalledWith({
            event: ANALYTICS_EVENT_INFO,
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
            event: ANALYTICS_EVENT_INFO,
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
            event: ANALYTICS_EVENT_INFO,
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
            event: ANALYTICS_EVENT_INFO,
            data: { component: card.constructor['type'], type: ANALYTICS_UNFOCUS_STR, target: 'card_number' }
        });
    });

    test('Analytics should produce an "info" event, of type "validationError", with the expected properties', () => {
        card.onErrorAnalytics({
            fieldType: 'encryptedCardNumber',
            errorCode: 'error.va.sf-cc-num.04',
            errorMessage: 'Enter the complete card number-sr'
        });

        expect(analyticsModule.createAnalyticsEvent).toHaveBeenCalledWith({
            event: ANALYTICS_EVENT_INFO,
            data: {
                component: card.constructor['type'],
                type: ANALYTICS_VALIDATION_ERROR_STR,
                target: 'card_number',
                validationErrorCode: 'error.va.sf-cc-num.04',
                validationErrorMessage: 'Enter the complete card number-sr'
            }
        });
    });
});

describe('Card: calls that generate "log" analytics should produce objects with the expected shapes ', () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});

        card = new CardElement({
            core: null,
            modules: {
                analytics: analyticsModule
            }
        });

        analyticsModule.createAnalyticsEvent = jest.fn(obj => {
            console.log('### analyticsPreProcessor.test:::: obj=', obj);
        });
    });

    test('Analytics should produce an "log" event, of type "submit", for a card PM', () => {
        card.submitAnalytics({ type: ANALYTICS_SUBMIT_STR });

        expect(analyticsModule.createAnalyticsEvent).toHaveBeenCalledWith({
            event: ANALYTICS_EVENT_LOG,
            data: {
                component: card.constructor['type'],
                type: ANALYTICS_SUBMIT_STR,
                message: 'Shopper clicked pay'
            }
        });
    });
});
