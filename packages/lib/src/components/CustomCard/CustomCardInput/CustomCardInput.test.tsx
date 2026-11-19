import { createRef, h } from 'preact';
import type { ComponentProps } from 'preact';
import { render, act } from '@testing-library/preact';
import CustomCardInput from './CustomCardInput';
import SecuredFieldsProvider from '../../internal/SecuredFields/SFP/SecuredFieldsProvider';
import { setupCoreMock } from '../../../../config/testMocks/setup-core-mock';
import type { CustomCardInputRef } from './CustomCardInput';
import type { BinLookupResponse, BrandObject } from '../../Card/types';

jest.mock('../../internal/SecuredFields/lib/CSF');

const { i18n, resources } = setupCoreMock().modules;

const createBrandObject = (brand: string): BrandObject => ({
    brand,
    cvcPolicy: 'required',
    enableLuhnCheck: true,
    supported: true
});

const createBinLookupResponse = (brands: string[], issuingCountryCode = 'NL'): BinLookupResponse => ({
    issuingCountryCode,
    supportedBrands: brands.map(createBrandObject)
});

// CustomCardInput renders no markup of its own: the merchant supplies the "data-cse" elements it mounts into
const createRootNode = (): HTMLElement => {
    const rootNode = document.createElement('div');
    ['encryptedCardNumber', 'encryptedExpiryDate', 'encryptedSecurityCode'].forEach(field => {
        const el = document.createElement('div');
        el.setAttribute('data-cse', field);
        rootNode.appendChild(el);
    });
    return rootNode;
};

describe('CustomCardInput', () => {
    let onChange: jest.Mock;
    let onValidationError: jest.Mock;
    let onError: jest.Mock;
    let ref: ReturnType<typeof createRef<CustomCardInputRef>>;

    // The SFP is internal to CustomCardInput (CardInput exposes it through setComponentRef), so we observe it through its prototype.
    // Spies call through, and are installed before render so the instance methods bound in the SFP constructor wrap them.
    let sfpRenderSpy: jest.SpyInstance;
    let sfpProcessBinLookupSpy: jest.SpyInstance;
    let sfpSetFocusOnSpy: jest.SpyInstance;
    let sfpUpdateStylesSpy: jest.SpyInstance;
    let sfpDestroySpy: jest.SpyInstance;

    const getSfpProps = () => sfpRenderSpy.mock.calls.at(-1)[0];

    const getInput = (): CustomCardInputRef => {
        if (!ref.current) throw new Error('CustomCardInput is not rendered');
        return ref.current;
    };

    const renderCustomCardInput = (props: Partial<ComponentProps<typeof CustomCardInput>> = {}) =>
        render(
            <CustomCardInput
                ref={ref}
                brand="card"
                type="card"
                loadingContext="test"
                clientKey="test_key"
                i18n={i18n}
                resources={resources}
                rootNode={createRootNode()}
                onChange={onChange}
                onError={onError}
                {...props}
                // Read by CustomCardInput through this.props, but missing from its props interface
                {...{ onValidationError }}
            />
        );

    beforeEach(() => {
        onChange = jest.fn();
        onValidationError = jest.fn();
        onError = jest.fn();
        ref = createRef<CustomCardInputRef>();

        sfpRenderSpy = jest.spyOn(SecuredFieldsProvider.prototype, 'render');
        sfpProcessBinLookupSpy = jest.spyOn(SecuredFieldsProvider.prototype, 'processBinLookupResponse');
        sfpSetFocusOnSpy = jest.spyOn(SecuredFieldsProvider.prototype, 'setFocusOn');
        sfpUpdateStylesSpy = jest.spyOn(SecuredFieldsProvider.prototype, 'updateStyles');
        sfpDestroySpy = jest.spyOn(SecuredFieldsProvider.prototype, 'destroy');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('rendering', () => {
        test('should not render any markup of its own', () => {
            const { container } = renderCustomCardInput();

            expect(container).toBeEmptyDOMElement();
        });

        test('should create the SecuredFieldsProvider with the brand as its type and the component type as its componentType', () => {
            renderCustomCardInput({ brand: 'visa', type: 'card' });

            expect(getSfpProps()).toEqual(expect.objectContaining({ type: 'visa', componentType: 'card' }));
        });

        test('should pass the configuration it extracts to the SecuredFieldsProvider', () => {
            const styles = { base: { color: 'red' } };
            const onBrand = jest.fn();
            renderCustomCardInput({ styles, onBrand, autoFocus: true, showWarnings: true });

            expect(getSfpProps()).toEqual(
                expect.objectContaining({
                    clientKey: 'test_key',
                    loadingContext: 'test',
                    styles,
                    onBrand,
                    autoFocus: true,
                    showWarnings: true,
                    exposeExpiryDate: false,
                    disableIOSArrowKeys: null
                })
            );
        });

        test('should handle SecuredFieldsProvider changes itself, rather than forwarding the onChange prop', () => {
            renderCustomCardInput();

            expect(getSfpProps().onChange).not.toBe(onChange);
        });
    });

    describe('onChange', () => {
        test('should report the initial state once the SecuredFieldsProvider is mounted', () => {
            renderCustomCardInput();

            expect(onChange).toHaveBeenCalledWith({ data: {}, valid: {}, errors: {}, isValid: false, selectedBrandValue: '' });
        });

        test('should report data, validity and isValid received from the SecuredFieldsProvider', async () => {
            renderCustomCardInput();

            await act(() => {
                getSfpProps().onChange({
                    data: { encryptedCardNumber: 'enc-number' },
                    valid: { encryptedCardNumber: true },
                    errors: {},
                    isSfpValid: true
                });
            });

            expect(onChange).toHaveBeenLastCalledWith({
                data: { encryptedCardNumber: 'enc-number' },
                valid: { encryptedCardNumber: true },
                errors: {},
                isValid: true,
                selectedBrandValue: ''
            });
        });

        test('should merge successive SecuredFieldsProvider changes instead of replacing the state', async () => {
            renderCustomCardInput();

            await act(() => {
                getSfpProps().onChange({
                    data: { encryptedCardNumber: 'enc-number' },
                    valid: { encryptedCardNumber: true },
                    errors: {},
                    isSfpValid: false
                });
            });
            await act(() => {
                getSfpProps().onChange({
                    data: { encryptedExpiryDate: 'enc-date' },
                    valid: { encryptedExpiryDate: true },
                    errors: {},
                    isSfpValid: true
                });
            });

            expect(onChange).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    data: { encryptedCardNumber: 'enc-number', encryptedExpiryDate: 'enc-date' },
                    valid: { encryptedCardNumber: true, encryptedExpiryDate: true },
                    isValid: true
                })
            );
        });
    });

    describe('validation errors', () => {
        test('should not call onValidationError when there are no errors', () => {
            renderCustomCardInput();

            expect(onValidationError).not.toHaveBeenCalled();
        });

        test('should call onValidationError with the errors of the fields that are not valid when validation is shown', async () => {
            renderCustomCardInput();

            await act(() => {
                getInput().showValidation?.();
            });

            expect(onValidationError).toHaveBeenCalled();
            const validationErrors = onValidationError.mock.calls.at(-1)[0];
            expect(validationErrors).toEqual(
                expect.arrayContaining([expect.objectContaining({ fieldType: 'encryptedCardNumber', error: expect.any(String) })])
            );
            expect(onChange).toHaveBeenLastCalledWith(
                expect.objectContaining({ errors: expect.objectContaining({ encryptedCardNumber: expect.objectContaining({ isValid: false }) }) })
            );
        });

        test('should report an empty error, with the rootNode, for a field whose error has been cleared', async () => {
            const rootNode = createRootNode();
            renderCustomCardInput({ rootNode });
            await act(() => {
                getInput().handleUnsupportedCard({ type: 'card', fieldType: 'encryptedCardNumber', error: 'unsupported-card' });
            });
            onValidationError.mockClear();

            await act(() => {
                getInput().handleUnsupportedCard({ type: 'card', fieldType: 'encryptedCardNumber', error: '' });
            });

            expect(onValidationError).toHaveBeenLastCalledWith([{ fieldType: 'encryptedCardNumber', error: '', rootNode }]);
        });
    });

    describe('methods exposed through the ref', () => {
        test('should expose the methods CustomCard relies on', () => {
            renderCustomCardInput();

            expect(ref.current).toEqual(
                expect.objectContaining({
                    processBinLookupResponse: expect.any(Function),
                    dualBrandingChangeHandler: expect.any(Function),
                    setFocusOn: expect.any(Function),
                    updateStyles: expect.any(Function),
                    showValidation: expect.any(Function),
                    handleUnsupportedCard: expect.any(Function)
                })
            );
        });

        test('should delegate setFocusOn to the SecuredFieldsProvider', () => {
            renderCustomCardInput();

            getInput().setFocusOn('encryptedCardNumber');

            expect(sfpSetFocusOnSpy).toHaveBeenCalledWith('encryptedCardNumber');
        });

        test('should delegate updateStyles to the SecuredFieldsProvider', () => {
            renderCustomCardInput();
            const styles = { base: { color: 'blue' } };

            getInput().updateStyles(styles);

            expect(sfpUpdateStylesSpy).toHaveBeenCalledWith(styles);
        });

        test('should delegate handleUnsupportedCard to the SecuredFieldsProvider, which reports the error and returns that the card is unsupported', async () => {
            const rootNode = createRootNode();
            renderCustomCardInput({ rootNode });
            let isUnsupported: boolean | undefined;

            await act(() => {
                isUnsupported = getInput().handleUnsupportedCard({ type: 'card', fieldType: 'encryptedCardNumber', error: 'unsupported-card' });
            });

            expect(isUnsupported).toBe(true);
            expect(onValidationError).toHaveBeenLastCalledWith([
                expect.objectContaining({ fieldType: 'encryptedCardNumber', error: 'unsupported-card', rootNode })
            ]);
        });

        test('should return false from handleUnsupportedCard when the error has been cleared', async () => {
            renderCustomCardInput();
            let isUnsupported: boolean | undefined;

            await act(() => {
                isUnsupported = getInput().handleUnsupportedCard({ type: 'card', fieldType: 'encryptedCardNumber', error: '' });
            });

            expect(isUnsupported).toBe(false);
        });
    });

    describe('binLookup', () => {
        test('should pass a single brand binLookup response to the SecuredFieldsProvider and report it as the selected brand', async () => {
            renderCustomCardInput();

            await act(() => {
                getInput().processBinLookupResponse(createBinLookupResponse(['visa']));
            });

            expect(sfpProcessBinLookupSpy).toHaveBeenCalledWith({ issuingCountryCode: 'NL', supportedBrands: [createBrandObject('visa')] });
            expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ selectedBrandValue: 'visa' }));
        });

        test('should only pass the lead brand to the SecuredFieldsProvider when the binLookup response is dual branded', async () => {
            renderCustomCardInput();

            await act(() => {
                getInput().processBinLookupResponse(createBinLookupResponse(['cartebancaire', 'visa']));
            });

            expect(sfpProcessBinLookupSpy).toHaveBeenCalledWith({ issuingCountryCode: 'NL', supportedBrands: [createBrandObject('cartebancaire')] });
        });

        test('should pass the brand the shopper selected to the SecuredFieldsProvider and report it', async () => {
            renderCustomCardInput();
            await act(() => {
                getInput().processBinLookupResponse(createBinLookupResponse(['cartebancaire', 'visa'], 'FR'));
            });

            await act(() => {
                getInput().dualBrandingChangeHandler('visa');
            });

            expect(sfpProcessBinLookupSpy).toHaveBeenLastCalledWith({
                issuingCountryCode: 'fr',
                supportedBrands: [createBrandObject('visa')],
                isDualBrandSelection: true
            });
            expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ selectedBrandValue: 'visa' }));
        });

        test('should ignore a dual brand selection that does not match one of the detected brands', async () => {
            renderCustomCardInput();
            await act(() => {
                getInput().processBinLookupResponse(createBinLookupResponse(['cartebancaire', 'visa']));
            });
            sfpProcessBinLookupSpy.mockClear();

            await act(() => {
                getInput().dualBrandingChangeHandler('amex');
            });

            expect(sfpProcessBinLookupSpy).not.toHaveBeenCalled();
        });

        test('should reset the selected brand when the binLookup is reset', async () => {
            renderCustomCardInput();
            await act(() => {
                getInput().processBinLookupResponse(createBinLookupResponse(['visa']));
            });

            await act(() => {
                getInput().processBinLookupResponse({} as BinLookupResponse, true);
            });

            expect(sfpProcessBinLookupSpy).toHaveBeenLastCalledWith({}, { brand: null, cvcPolicy: undefined });
            expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ selectedBrandValue: '' }));
        });

        test('should reset a single branded component back to its own brand when the binLookup is reset', async () => {
            renderCustomCardInput({ type: 'bcmc', brand: 'bcmc' });

            await act(() => {
                getInput().processBinLookupResponse({} as BinLookupResponse, true);
            });

            expect(sfpProcessBinLookupSpy).toHaveBeenLastCalledWith({}, { brand: 'bcmc', cvcPolicy: undefined });
        });
    });

    describe('unmounting', () => {
        test('should destroy the SecuredFieldsProvider', () => {
            const { unmount } = renderCustomCardInput();
            sfpDestroySpy.mockClear();

            unmount();

            expect(sfpDestroySpy).toHaveBeenCalledTimes(1);
        });
    });
});
