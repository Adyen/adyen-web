export const COUNTDOWN_MINUTES = 15; // min
export const STATUS_INTERVAL = 2000; // ms
export const THROTTLE_TIME = 60000; // ms
export const THROTTLE_INTERVAL = 10000; // ms

export default {
    STATUS_INTERVAL,
    COUNTDOWN_MINUTES,
    THROTTLE_TIME,
    THROTTLE_INTERVAL,
    type: 'mbway',
    messageTextId: 'mbway.confirmPayment', // identifier for a translation string
    awaitTextId: 'await.waitForConfirmation',
    showCountdownTimer: false
};
