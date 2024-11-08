import { test } from '../../../../fixtures/card.fixture';

test(
    '#1 Enter number of unsupported card, ' + 'then check UI shows an error ' + 'then PASTE supported card & check UI error is cleared',
    async () => {
        // Wait for field to appear in DOM
        // Fill card field with unsupported number
        // Test UI shows "Unsupported card" error
        // Past card field with supported number
        // Test UI shows "Unsupported card" error has gone
    }
);

test(
    '#2 Enter number of unsupported card, ' +
        'then check UI shows an error ' +
        'then press the Pay button ' +
        'then check UI shows more errors ' +
        'then PASTE supported card & check PAN UI errors are cleared whilst others persist',
    async () => {
        // Wait for field to appear in DOM
        // Fill card field with unsupported number
        // Test UI shows "Unsupported card" error
        // Click Pay (which will call showValidation on all fields)
        // Past card field with supported number
        // Test UI shows "Unsupported card" error has gone
        // PAN error cleared but other errors persist
    }
);

test('#3 Enter number of unsupported card, ' + 'then check UI shows an error ' + 'then PASTE card not in db check UI error is cleared', async () => {
    // Wait for field to appear in DOM
    // Fill card field with unsupported number
    // Test UI shows "Unsupported card" error
    // Past card field with supported number
    // Test UI shows "Unsupported card" error has gone
});

test('#4 Enter number of unsupported card, ' + 'then check UI shows an error ' + 'then delete PAN & check UI error is cleared', async () => {
    // Wait for field to appear in DOM
    // Fill card field with unsupported number
    // Test UI shows "Unsupported card" error
    // delete card number
    // Test UI shows "Unsupported card" error has gone
});
