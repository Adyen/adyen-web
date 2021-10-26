import CardComponentPage from './CardComponent.page';

const cardPage = new CardComponentPage();

fixture`Test that bin mocking isn't turned on in the SDK`.page(cardPage.pageUrl);

/**
 * Check that bin mocking isn't turned on in the SDK
 * - this is used for testing (in triggerBinLookup.ts) but if left on will break or skew the tests
 */
test('Check for SDK Bin mocking', async () => {
    await cardPage.checkSDKMocking();
});
