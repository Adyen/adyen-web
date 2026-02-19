import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { getAddressHandler, getAutoJumpHandler, getFocusHandler, setFocusOnFirstField } from './handlers';
import ua from '../../../internal/SecuredFields/lib/CSF/utils/userAgent';

jest.mock('../../../internal/SecuredFields/lib/constants', () => ({
    CREDIT_CARD_SF_FIELDS: ['encryptedCardNumber', 'encryptedExpiryDate', 'encryptedSecurityCode'],
    ENCRYPTED_CARD_NUMBER: 'encryptedCardNumber'
}));

const windowScrollToMock = jest.fn();
jest.mock('../../../../utils/windowScrollTo', () => ({
    windowScrollTo: (element: HTMLElement) => windowScrollToMock(element)
}));

const selectOneMock = jest.fn();
jest.mock('../../../internal/SecuredFields/lib/utilities/dom', () => ({
    selectOne: (...args) => selectOneMock(...args)
}));

describe('CardInput handlers', () => {
    beforeEach(() => {
        ua.__IS_IOS = false;
        windowScrollToMock.mockClear();
        selectOneMock.mockReset();
    });

    describe('setFocusOnFirstField', () => {
        test('does nothing when isValidating is false', () => {
            const sfp: any = {
                current: {
                    getRootNode: jest.fn(),
                    setFocusOn: jest.fn()
                }
            };

            setFocusOnFirstField(false, sfp, 'encryptedExpiryDate');

            expect(sfp.current.getRootNode).not.toHaveBeenCalled();
            expect(sfp.current.setFocusOn).not.toHaveBeenCalled();
            expect(windowScrollToMock).not.toHaveBeenCalled();
        });

        test('on iOS it scrolls to the label for the requested field', () => {
            ua.__IS_IOS = true;

            const fieldToFocus = 'encryptedExpiryDate';
            render(<div data-id={fieldToFocus} data-testid={fieldToFocus} />);
            const elementToScrollTo = screen.getByTestId(fieldToFocus);

            const sfp: any = {
                current: {
                    getRootNode: () => document,
                    setFocusOn: jest.fn()
                }
            };

            setFocusOnFirstField(true, sfp, fieldToFocus);

            expect(windowScrollToMock).toHaveBeenCalledTimes(1);
            expect(windowScrollToMock.mock.calls[0][0]).toBe(elementToScrollTo);
        });

        test('when field is a secured field it calls sfp.setFocusOn', () => {
            const sfp: any = {
                current: {
                    getRootNode: jest.fn(() => document.createElement('div')),
                    setFocusOn: jest.fn()
                }
            };

            setFocusOnFirstField(true, sfp, 'encryptedExpiryDate');

            expect(sfp.current.setFocusOn).toHaveBeenCalledWith('encryptedExpiryDate');
        });

        test('when field is not a secured field it focuses on the input via selectOne', () => {
            const focusMock = jest.fn();
            selectOneMock.mockReturnValue({ focus: focusMock });

            const sfp: any = {
                current: {
                    getRootNode: jest.fn(() => document.createElement('div')),
                    setFocusOn: jest.fn()
                }
            };

            setFocusOnFirstField(true, sfp, 'holderName');

            expect(selectOneMock).toHaveBeenCalledTimes(1);
            expect(selectOneMock.mock.calls[0][1]).toBe('[name="holderName"]');
            expect(focusMock).toHaveBeenCalledTimes(1);
            expect(sfp.current.setFocusOn).not.toHaveBeenCalled();
        });

        test('when field is country it focuses the dropdown filter input', () => {
            const focusMock = jest.fn();
            selectOneMock.mockReturnValue({ focus: focusMock });

            const sfp: any = {
                current: {
                    getRootNode: jest.fn(() => document.createElement('div')),
                    setFocusOn: jest.fn()
                }
            };

            setFocusOnFirstField(true, sfp, 'country');

            expect(selectOneMock).toHaveBeenCalledTimes(1);
            expect(selectOneMock.mock.calls[0][1]).toBe('.adyen-checkout__field--country .adyen-checkout__filter-input');
            expect(focusMock).toHaveBeenCalledTimes(1);
        });

        test('when field is taxNumber it maps to the KCP field name for focusing', () => {
            const focusMock = jest.fn();
            selectOneMock.mockReturnValue({ focus: focusMock });

            const sfp: any = {
                current: {
                    getRootNode: jest.fn(() => document.createElement('div')),
                    setFocusOn: jest.fn()
                }
            };

            setFocusOnFirstField(true, sfp, 'taxNumber');

            expect(selectOneMock).toHaveBeenCalledTimes(1);
            expect(selectOneMock.mock.calls[0][1]).toBe('[name="kcpTaxNumberOrDOB"]');
            expect(focusMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('getAddressHandler', () => {
        test('updates billingAddress data, valid and errors', () => {
            const setFormData = jest.fn();
            const setFormValid = jest.fn();
            const setFormErrors = jest.fn();

            const handler = getAddressHandler(setFormData as any, setFormValid as any, setFormErrors as any);

            const address = {
                data: { street: 'Infinite Loop', country: 'US' },
                isValid: true,
                errors: { street: null }
            };

            handler(address);

            expect(setFormData).toHaveBeenCalledWith('billingAddress', address.data);
            expect(setFormValid).toHaveBeenCalledWith('billingAddress', true);
            expect(setFormErrors).toHaveBeenCalledWith('billingAddress', address.errors);
        });
    });

    describe('getFocusHandler', () => {
        test('sets the focused element and calls onFocus when focus=true', () => {
            const setFocusedElement = jest.fn();
            const onFocus = jest.fn();
            const onBlur = jest.fn();

            const handler = getFocusHandler(setFocusedElement as any, onFocus as any, onBlur as any);

            const event: any = {
                currentFocusObject: 'encryptedCardNumber',
                focus: true,
                fieldType: 'encryptedCardNumber'
            };

            handler(event);

            expect(setFocusedElement).toHaveBeenCalledWith('encryptedCardNumber');
            expect(onFocus).toHaveBeenCalledWith('encryptedCardNumber', event);
            expect(onBlur).not.toHaveBeenCalled();
        });

        test('sets the focused element and calls onBlur when focus=false', () => {
            const setFocusedElement = jest.fn();
            const onFocus = jest.fn();
            const onBlur = jest.fn();

            const handler = getFocusHandler(setFocusedElement as any, onFocus as any, onBlur as any);

            const event: any = {
                currentFocusObject: 'encryptedCardNumber',
                focus: false,
                fieldType: 'encryptedCardNumber'
            };

            handler(event);

            expect(setFocusedElement).toHaveBeenCalledWith('encryptedCardNumber');
            expect(onBlur).toHaveBeenCalledWith('encryptedCardNumber', event);
            expect(onFocus).not.toHaveBeenCalled();
        });
    });

    describe('getAutoJumpHandler', () => {
        test('focuses first subsequent non-optional secured field', async () => {
            const isAutoJumping: any = { current: false };

            const sfp: any = {
                current: {
                    sfIsOptionalOrHidden: jest.fn(field => field === 'encryptedExpiryDate'),
                    setFocusOn: jest.fn(),
                    getRootNode: jest.fn()
                }
            };

            const handler = getAutoJumpHandler(isAutoJumping, sfp, ['encryptedCardNumber', 'encryptedExpiryDate', 'encryptedSecurityCode']);

            handler();

            await Promise.resolve();

            expect(sfp.current.sfIsOptionalOrHidden).toHaveBeenCalledWith('encryptedExpiryDate');
            expect(sfp.current.sfIsOptionalOrHidden).toHaveBeenCalledWith('encryptedSecurityCode');
            expect(sfp.current.setFocusOn).toHaveBeenCalledWith('encryptedSecurityCode');
            expect(isAutoJumping.current).toBe(false);
        });

        test('focuses the first subsequent non-secured field if encountered', async () => {
            const isAutoJumping: any = { current: false };

            const focusMock = jest.fn();
            selectOneMock.mockReturnValue({ focus: focusMock });

            const sfp: any = {
                current: {
                    sfIsOptionalOrHidden: jest.fn(() => true),
                    setFocusOn: jest.fn(),
                    getRootNode: jest.fn(() => document.createElement('div'))
                }
            };

            const handler = getAutoJumpHandler(isAutoJumping, sfp, ['encryptedCardNumber', 'holderName', 'encryptedSecurityCode']);

            handler();

            await Promise.resolve();

            expect(selectOneMock).toHaveBeenCalledTimes(1);
            expect(selectOneMock.mock.calls[0][1]).toBe('[name="holderName"]');
            expect(focusMock).toHaveBeenCalledTimes(1);
            expect(sfp.current.setFocusOn).not.toHaveBeenCalled();
        });

        test('ignores subsequent calls while auto-jumping to prevent double focusing', async () => {
            const isAutoJumping: any = { current: false };

            const sfp: any = {
                current: {
                    sfIsOptionalOrHidden: jest.fn(() => false),
                    setFocusOn: jest.fn(),
                    getRootNode: jest.fn()
                }
            };

            const handler = getAutoJumpHandler(isAutoJumping, sfp, ['encryptedCardNumber', 'encryptedExpiryDate']);

            handler();
            handler();

            await Promise.resolve();

            expect(sfp.current.setFocusOn).toHaveBeenCalledTimes(1);
            expect(isAutoJumping.current).toBe(false);
        });
    });
});
