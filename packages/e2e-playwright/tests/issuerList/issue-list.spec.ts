import { test, expect } from '../../pages/issuerList/issuer-list.fixture';

test('should select issuers on dropdown and update pay button label', async ({ issuerListPage }) => {
    const { issuerList } = issuerListPage;

    await expect(issuerList.submitButton).toHaveText('Continue');

    await issuerList.selectIssuerOnSelectorDropdown('Test Issuer 5');
    await expect(issuerList.submitButton).toHaveText('Continue to Test Issuer 5');

    await issuerList.selectIssuerOnSelectorDropdown('Test Issuer');
    await expect(issuerList.submitButton).toHaveText('Continue to Test Issuer');
});

test('should select highlighted issuer and update pay button label', async ({ issuerListPage }) => {
    const { issuerList } = issuerListPage;

    await issuerList.selectHighlightedIssuer('Test Issuer 5');
    await expect(issuerList.submitButton).toHaveText('Continue to Test Issuer 5');

    await issuerList.selectHighlightedIssuer('Test Issuer 4');
    await expect(issuerList.submitButton).toHaveText('Continue to Test Issuer 4');

    await expect(issuerList.highlightedIssuerButtonGroup.getByRole('button', { pressed: true })).toHaveText('Test Issuer 4');
    await expect(issuerList.selectorCombobox).toHaveValue('Select your bank');
});
