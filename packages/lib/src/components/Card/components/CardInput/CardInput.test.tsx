import { createRef, h } from 'preact';
import { render, screen, fireEvent, act } from '@testing-library/preact';
import CardInput from './CardInput';
import { CardInputDataState, CardInputValidState } from './types';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { AmountProvider } from '../../../../core/Context/AmountProvider';

jest.mock('../../../internal/SecuredFields/lib/CSF');

let valid = {} as CardInputValidState;
let data = {} as CardInputDataState;
let onChange;
beforeEach(() => {
    onChange = jest.fn((state): any => {
        valid = state.valid;
        data = state.data;
    });
});

const i18n = global.i18n;
const configuration = { koreanAuthenticationRequired: true };

const cardInputRequiredProps = {
    i18n: global.i18n,
    clientKey: 'xxxx',
    loadingContext: 'test',
    resources: global.resources,
    brandsIcons: [],
    showPayButton: false,
    onSubmitAnalytics: jest.fn()
};

const renderCardInput = ui => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <AmountProvider amount={{ value: 1000, currency: 'USD' }} providerRef={createRef()}>
                {ui}
            </AmountProvider>
        </CoreProvider>
    );
};

describe('CardInput', () => {
    test('Renders a normal Card form', () => {
        const { container } = renderCardInput(<CardInput {...cardInputRequiredProps} />);
        /* eslint-disable testing-library/no-node-access, testing-library/no-container */
        expect(container.querySelector('[data-cse="encryptedCardNumber"]')).toBeTruthy();
        expect(container.querySelector('[data-cse="encryptedExpiryDate"]')).toBeTruthy();
        expect(container.querySelector('[data-cse="encryptedSecurityCode"]')).toBeTruthy();
        /* eslint-enable testing-library/no-node-access, testing-library/no-container */
    });

    test('Has HolderName element', () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} hasHolderName={true} />);
        expect(screen.getByText('Name on card')).toBeVisible();
    });
});

describe('CardInput - Brands beneath Card Number field', () => {
    test('should render brands under Card number field', () => {
        const brandsIcons = [
            { name: 'visa', icon: 'visa.png' },
            { name: 'mc', icon: 'mc.png' }
        ];
        renderCardInput(<CardInput {...cardInputRequiredProps} brandsIcons={brandsIcons} />);

        expect(screen.getByAltText('VISA')).toBeVisible();
        expect(screen.getByAltText('MasterCard')).toBeVisible();
    });

    test('should hide all brand icons when brand is detected', () => {
        const detectedBrand = 'visa';
        const brandsIcons = [
            { name: 'visa', icon: 'visa.png' },
            { name: 'mc', icon: 'mc.png' },
            { name: 'amex', icon: 'amex.png' }
        ];
        const { container } = renderCardInput(<CardInput {...cardInputRequiredProps} brand={detectedBrand} brandsIcons={brandsIcons} />);

        /* eslint-disable testing-library/no-node-access, testing-library/no-container */
        expect(container.querySelector('.adyen-checkout__card__brands--hidden')).toBeTruthy();
        /* eslint-enable testing-library/no-node-access, testing-library/no-container */
    });

    test('should show all brand icons when no brand is detected', () => {
        const detectedBrand = 'card';
        const brandsIcons = [
            { name: 'visa', icon: 'visa.png' },
            { name: 'mc', icon: 'mc.png' },
            { name: 'amex', icon: 'amex.png' }
        ];
        const { container } = renderCardInput(<CardInput {...cardInputRequiredProps} brand={detectedBrand} brandsIcons={brandsIcons} />);
        /* eslint-disable testing-library/no-node-access, testing-library/no-container */
        expect(container.querySelector('.adyen-checkout__card__brands--hidden')).toBeNull();
        /* eslint-enable testing-library/no-node-access, testing-library/no-container */
    });
});

describe('CardInput > holderName', () => {
    test('Does not have HolderName element', () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} />);
        expect(screen.queryByText('Name on card')).toBeNull();
    });

    test('holderName required, so valid.holderName is false', () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} holderNameRequired={true} hasHolderName={true} onChange={onChange} />);
        expect(valid.holderName).toBe(false);
    });

    test('holderName required, valid.holderName is false, add text to make valid.holderName = true', () => {
        const placeholder = { holderName: 'Joe' };
        render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <AmountProvider providerRef={createRef()}>
                    <CardInput
                        {...cardInputRequiredProps}
                        holderNameRequired={true}
                        hasHolderName={true}
                        onChange={onChange}
                        i18n={i18n}
                        placeholders={placeholder}
                    />
                </AmountProvider>
            </CoreProvider>
        );
        expect(valid.holderName).toBe(false);
        const field = screen.getByPlaceholderText(placeholder.holderName);
        fireEvent.blur(field, { target: { value: 'joe blogs' } });

        expect(data.holderName).toBe('joe blogs');
        expect(valid.holderName).toBe(true);
    });

    test('holderName required, data.holderName passed into comp - valid.holderName is true', () => {
        const dataObj = { holderName: 'J Smith' };
        renderCardInput(<CardInput {...cardInputRequiredProps} holderNameRequired={true} hasHolderName={true} data={dataObj} onChange={onChange} />);
        expect(valid.holderName).toBe(true);
        expect(data.holderName).toBe('J Smith');
    });

    test('holderName not required, valid.holderName is true', () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} hasHolderName={true} onChange={onChange} />);

        expect(valid.holderName).toBe(true);
    });

    test('holderName not required, data.holderName passed into comp - valid.holderName is true', () => {
        const dataObj = { holderName: 'J Smith' };
        renderCardInput(<CardInput {...cardInputRequiredProps} hasHolderName={true} data={dataObj} onChange={onChange} />);

        expect(valid.holderName).toBe(true);
        expect(data.holderName).toBe('J Smith');
    });

    test('does not show the holder name first by default', () => {
        render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <AmountProvider providerRef={createRef()}>
                    <CardInput {...cardInputRequiredProps} hasHolderName={true} />
                </AmountProvider>
            </CoreProvider>
        );

        const select = screen.getByRole('form');

        /* eslint-disable testing-library/no-node-access */
        const children = select.children;

        const positionDiv = children.item(0); // the instrucitions will be hidden while loading

        const positionDivChildren = positionDiv.children;

        const loadingWrapper = positionDivChildren.item(1); // children.item(0) is the spinner

        const loadingWrapperChildren = loadingWrapper.children;

        // First visible element is the Card number
        const firstFormElement = loadingWrapperChildren.item(0);

        const firstFormElementChildren = firstFormElement.children;

        const label = firstFormElementChildren.item(0);

        const labelChildren = label.children;
        /* eslint-enable testing-library/no-node-access */

        expect(labelChildren.item(0).textContent).toEqual('Card number');
    });

    test('holder name is first visible element', () => {
        render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <AmountProvider providerRef={createRef()}>
                    <CardInput {...cardInputRequiredProps} hasHolderName={true} positionHolderNameOnTop={true} />
                </AmountProvider>
            </CoreProvider>
        );

        const select = screen.getByRole('form');

        /* eslint-disable testing-library/no-node-access */
        const children = select.children;

        const positionDiv = children.item(0); // the instrucitions will be hidden while loading

        const positionDivChildren = positionDiv.children;

        const loadingWrapper = positionDivChildren.item(1); // children.item(0) is the spinner

        const loadingWrapperChildren = loadingWrapper.children;

        // First visible element is the Holder name
        const firstFormElement = loadingWrapperChildren.item(0);

        const firstFormElementChildren = firstFormElement.children;

        const label = firstFormElementChildren.item(0);

        const labelChildren = label.children;
        /* eslint-enable testing-library/no-node-access */

        expect(labelChildren.item(0).textContent).toEqual('Name on card');
    });
});

describe('CardInput shows/hides KCP fields when koreanAuthenticationRequired is set to true and either countryCode or issuingCountryCode is set to kr', () => {
    let cardInputRef;
    const setComponentRef = ref => {
        cardInputRef = ref;
    };

    test('Renders a card form with kcp fields since countryCode is kr', () => {
        const { container } = renderCardInput(<CardInput {...cardInputRequiredProps} configuration={configuration} countryCode="kr" />);
        /* eslint-disable testing-library/no-node-access, testing-library/no-container */
        expect(container.querySelector('.adyen-checkout__card__kcp-authentication')).toBeTruthy();
        /* eslint-enable testing-library/no-node-access, testing-library/no-container */
    });

    test('Renders a card form with kcp fields since countryCode is kr & issuingCountryCode is kr', () => {
        const { container } = renderCardInput(
            <CardInput {...cardInputRequiredProps} configuration={configuration} countryCode="kr" setComponentRef={setComponentRef} />
        );
        void act(() => {
            cardInputRef?.processBinLookupResponse({ issuingCountryCode: 'kr' }, false);
        });
        /* eslint-disable testing-library/no-node-access, testing-library/no-container */
        expect(container.querySelector('.adyen-checkout__card__kcp-authentication')).toBeTruthy();
        /* eslint-enable testing-library/no-node-access, testing-library/no-container */
    });

    test('Renders a card form with kcp fields since countryCode is not kr but issuingCountryCode is kr', () => {
        const { container } = renderCardInput(
            <CardInput {...cardInputRequiredProps} configuration={configuration} setComponentRef={setComponentRef} />
        );
        void act(() => {
            cardInputRef?.processBinLookupResponse({ issuingCountryCode: 'kr' }, false);
        });
        /* eslint-disable testing-library/no-node-access, testing-library/no-container */
        expect(container.querySelector('.adyen-checkout__card__kcp-authentication')).toBeTruthy();
        /* eslint-enable testing-library/no-node-access, testing-library/no-container */
    });

    test('Renders a card form with no kcp fields since countryCode is not kr', () => {
        const { container } = renderCardInput(<CardInput {...cardInputRequiredProps} configuration={configuration} />);
        /* eslint-disable testing-library/no-node-access, testing-library/no-container */
        expect(container.querySelector('.adyen-checkout__card__kcp-authentication')).toBeNull();
        /* eslint-enable testing-library/no-node-access, testing-library/no-container */
    });

    test('Renders a card form with no kcp fields since countryCode is kr but issuingCountryCode is not kr', () => {
        const { container } = renderCardInput(
            <CardInput {...cardInputRequiredProps} configuration={configuration} countryCode="kr" setComponentRef={setComponentRef} />
        );
        void act(() => {
            cardInputRef?.processBinLookupResponse({ issuingCountryCode: 'us' }, false);
        });
        /* eslint-disable testing-library/no-node-access, testing-library/no-container */
        expect(container.querySelector('.adyen-checkout__card__kcp-authentication')).toBeNull();
        /* eslint-enable testing-library/no-node-access, testing-library/no-container */
    });

    test('Renders a card form with no kcp fields since countryCode is not kr & issuingCountryCode is not kr', () => {
        const { container } = renderCardInput(
            <CardInput {...cardInputRequiredProps} configuration={configuration} setComponentRef={setComponentRef} />
        );
        void act(() => {
            cardInputRef?.processBinLookupResponse({ issuingCountryCode: 'us' }, false);
        });
        /* eslint-disable testing-library/no-node-access, testing-library/no-container */
        expect(container.querySelector('.adyen-checkout__card__kcp-authentication')).toBeNull();
        /* eslint-enable testing-library/no-node-access, testing-library/no-container */
    });
});

describe('CardInput never shows KCP fields when koreanAuthenticationRequired is set to false', () => {
    test('countryCode is kr', () => {
        configuration.koreanAuthenticationRequired = false;
        const { container } = renderCardInput(<CardInput {...cardInputRequiredProps} configuration={configuration} countryCode="kr" />);
        /* eslint-disable testing-library/no-node-access, testing-library/no-container */
        expect(container.querySelector('.adyen-checkout__card__kcp-authentication')).toBeNull();
        /* eslint-enable testing-library/no-node-access, testing-library/no-container */
    });

    test('countryCode is kr & issuingCountryCode is kr', () => {
        let cardInputRef;
        const setComponentRef = ref => {
            cardInputRef = ref;
        };

        const { container } = renderCardInput(
            <CardInput {...cardInputRequiredProps} configuration={configuration} countryCode="kr" setComponentRef={setComponentRef} />
        );
        void act(() => {
            cardInputRef?.processBinLookupResponse({ issuingCountryCode: 'kr' }, false);
        });
        /* eslint-disable testing-library/no-node-access, testing-library/no-container */
        expect(container.querySelector('.adyen-checkout__card__kcp-authentication')).toBeNull();
        /* eslint-enable testing-library/no-node-access, testing-library/no-container */
    });
});

describe('CardInput > Installments', () => {
    const installments = {
        card: {
            values: [1, 2, 3]
        }
    };

    test('should not display installments if fundingSource is debit', () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} fundingSource={'debit'} installmentOptions={installments} />);
        expect(screen.queryByText('Number of installments')).toBeNull();
    });

    test('should not display installments if fundingSource is prepaid', () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} fundingSource={'prepaid'} installmentOptions={installments} />);
        expect(screen.queryByText('Number of installments')).toBeNull();
    });

    test('should display installments if fundingSource is credit', () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} fundingSource={'credit'} installmentOptions={installments} />);
    });

    test('should display installments if fundingSource undefined', () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} i18n={i18n} installmentOptions={installments} />);
        expect(screen.getByText('Number of installments')).toBeVisible();
    });
});
