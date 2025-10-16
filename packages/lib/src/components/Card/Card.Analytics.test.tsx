import { CardElement } from './Card';
import Analytics from '../../core/Analytics';
import {
    ANALYTICS_CONFIGURED_STR,
    ANALYTICS_FOCUS_STR,
    ANALYTICS_RENDERED_STR,
    ANALYTICS_SUBMIT_STR,
    ANALYTICS_UNFOCUS_STR
} from '../../core/Analytics/constants';
import { AnalyticsInfoEvent } from '../../core/Analytics/AnalyticsInfoEvent';
import { AnalyticsLogEvent } from '../../core/Analytics/AnalyticsLogEvent';

const analyticsModule = Analytics({ analytics: {}, analyticsContext: '', locale: '', clientKey: '' });

let card;

describe('Card: calls that generate "info" analytics should produce objects with the expected shapes ', () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});

        card = new CardElement(global.core, {
            modules: {
                analytics: analyticsModule
            }
        });

        // @ts-ignore it's a test
        analyticsModule.sendAnalytics = jest.fn(() => {});
    });

    test('Analytics should produce an "info" event, of type "rendered", for a card PM', () => {
        const event = new AnalyticsInfoEvent({
            type: ANALYTICS_RENDERED_STR
        });

        card.submitAnalytics(event);

        expect(analyticsModule.sendAnalytics).toHaveBeenCalledWith({
            component: card.constructor['type'],
            type: ANALYTICS_RENDERED_STR,
            timestamp: expect.any(String),
            id: expect.any(String),
            configData: expect.any(Object)
        });
    });

    test('Analytics should produce an "info" event, of type "rendered", for a storedCard PM', () => {
        const event = new AnalyticsInfoEvent({
            type: ANALYTICS_RENDERED_STR,
            isStoredPaymentMethod: true,
            brand: 'mc'
        });

        card.submitAnalytics(event);

        expect(analyticsModule.sendAnalytics).toHaveBeenCalledWith({
            component: card.constructor['type'],
            type: ANALYTICS_RENDERED_STR,
            isStoredPaymentMethod: true,
            brand: 'mc',
            timestamp: expect.any(String),
            id: expect.any(String),
            configData: expect.any(Object)
        });
    });

    test('Analytics should produce an "info" event, of type "configured", for a card PM', () => {
        const event = new AnalyticsInfoEvent({
            type: ANALYTICS_CONFIGURED_STR
        });
        card.submitAnalytics(event);

        expect(analyticsModule.sendAnalytics).toHaveBeenCalledWith({
            component: card.constructor['type'],
            type: ANALYTICS_CONFIGURED_STR,
            timestamp: expect.any(String),
            id: expect.any(String)
        });
    });

    test('Analytics should produce an "info" event, of type "configured", for a storedCard PM', () => {
        const event = new AnalyticsInfoEvent({
            type: ANALYTICS_CONFIGURED_STR,
            isStoredPaymentMethod: true,
            brand: 'mc'
        });

        card.submitAnalytics(event);

        expect(analyticsModule.sendAnalytics).toHaveBeenCalledWith({
            component: card.constructor['type'],
            type: ANALYTICS_CONFIGURED_STR,
            isStoredPaymentMethod: true,
            brand: 'mc',
            timestamp: expect.any(String),
            id: expect.any(String)
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

        expect(analyticsModule.sendAnalytics).toHaveBeenCalledWith({
            component: card.constructor['type'],
            type: ANALYTICS_FOCUS_STR,
            target: 'card_number',
            timestamp: expect.any(String),
            id: expect.any(String)
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

        expect(analyticsModule.sendAnalytics).toHaveBeenCalledWith({
            component: card.constructor['type'],
            type: ANALYTICS_UNFOCUS_STR,
            target: 'card_number',
            timestamp: expect.any(String),
            id: expect.any(String)
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

        analyticsModule.sendAnalytics = jest.fn(() => null);
    });

    test('Analytics should produce an "log" event, of type "submit", for a card PM', () => {
        const event = new AnalyticsLogEvent({
            type: ANALYTICS_SUBMIT_STR,
            message: 'Shopper clicked pay'
        });

        card.submitAnalytics(event);

        expect(analyticsModule.sendAnalytics).toHaveBeenCalledWith({
            component: card.constructor['type'],
            type: ANALYTICS_SUBMIT_STR,
            message: 'Shopper clicked pay',
            timestamp: expect.any(String),
            id: expect.any(String)
        });
    });
});
