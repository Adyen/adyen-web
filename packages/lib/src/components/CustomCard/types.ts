import { CardBrandsConfiguration } from '../Card/types';
import { Placeholders, SFError } from '../Card/components/CardInput/types';
import UIElement from '../internal/UIElement';
import {
    CbObjOnAllValid,
    CbObjOnBinLookup,
    CbObjOnBinValue,
    CbObjOnBrand,
    CbObjOnConfigSuccess,
    CbObjOnFieldValid,
    CbObjOnFocus,
    CbObjOnLoad,
    StylesObject
} from '../internal/SecuredFields/lib/types';
import Language from '../../language';

export type CustomCardConfiguration = {
    /**
     * Automatically shift the focus from one field to another. Usually happens from a valid Expiry Date field to the Security Code field,
     * but some BINS also allow us to know that the PAN is complete, in which case we can shift focus to the date field
     * @defaultValue `true`
     *
     * - merchant set config option
     */
    autoFocus?: boolean;

    /**
     * List of brands accepted by the component
     * @internal
     * - but can also be overwritten by merchant config option
     */
    brands?: string[];

    /**
     * Configuration specific to brands
     * - merchant set config option
     */
    brandsConfiguration?: CardBrandsConfiguration;

    /**
     * Defines the size of the challenge Component
     *
     * 01: [250px, 400px]
     * 02: [390px, 400px]
     * 03: [500px, 600px]
     * 04: [600px, 400px]
     * 05: [100%, 100%]
     *
     * @defaultValue '02'
     *
     * - merchant set config option
     */
    challengeWindowSize?: '01' | '02' | '03' | '04' | '05';

    /**
     * Turn on the procedure to force the arrow keys on an iOS soft keyboard to always be disabled
     * @defaultValue `false`
     *
     * - merchant set config option
     */
    disableIOSArrowKeys?: boolean;

    /**
     * Allow binLookup process to occur
     * @defaultValue `true`
     *
     * - merchant set config option
     */
    doBinLookup?: boolean;

    /** @internal */
    i18n?: Language;

    /**
     * For some scenarios make the card input fields (PAN, Expiry Date, Security Code) have type="tel" rather than type="text" inputmode="numeric"
     * @defaultValue `false`
     *
     * - merchant set config option
     */
    legacyInputMode?: boolean;

    /** @internal */
    loadingContext?: string;

    /**
     * Adds type="password" to the Security code input field, causing its value to be masked
     * @defaultValue `false`
     *
     * - merchant set config option
     */
    maskSecurityCode?: boolean;

    /**
     * Specify the minimum expiry date that will be considered valid
     *
     * - merchant set config option
     */
    minimumExpiryDate?: string;

    /**
     * After binLookup call - provides the brand(s) we detect the user is entering, and if we support the brand(s)
     * - merchant set config option
     */
    onBinLookup?: (event: CbObjOnBinLookup) => void;

    /**
     * Provides the BIN Number of the card (up to 6 digits), called as the user types in the PAN.
     * - merchant set config option
     */
    onBinValue?: (event: CbObjOnBinValue) => void;

    /**
     * Called once we detect the card brand.
     * - merchant set config option
     */
    onBrand?: (event: CbObjOnBrand) => void;

    /**
     * Called once the card input fields are ready to use.
     * - merchant set config option
     */
    onConfigSuccess?: (event: CbObjOnConfigSuccess) => void;

    /**
     * Called when *all* the securedFields becomes valid
     *  Also called again if one of the fields moves out of validity.
     */
    onAllValid?: (event: CbObjOnAllValid) => void;

    /**
     * Called when a field becomes valid and also if a valid field changes and becomes invalid.
     * For the card number field, it returns the last 4 digits of the card number.
     * - merchant set config option
     */
    onFieldValid?: (event: CbObjOnFieldValid) => void;

    /**
     * Called when a field gains focus.
     * - merchant set config option
     */
    onFocus?: (event: CbObjOnFocus) => void;

    /**
     * Called once all the card input fields have been created but are not yet ready to use.
     * - merchant set config option
     */
    onLoad?: (event: CbObjOnLoad) => void;

    /**
     * Called when a Component is told by a SecuredField that the Enter key has been pressed.
     * - merchant set config option
     */
    onEnterKeyPressed?: (activeElement: Element, component: UIElement) => void;

    /**
     * Called as errors are detected within the securedFields
     * - merchant set config option
     */
    onValidationError?: (validationErrors: ValidationError[]) => void;

    /**
     * Configure placeholder text for holderName, cardNumber, expirationDate, securityCode and password.
     * - merchant set config option
     */
    placeholders?: Placeholders;

    /**
     * Object to configure the styling of the inputs in the iframes that are used to present the PAN, Expiry Date & Security Code fields
     * - merchant set config option
     */
    styles?: StylesObject;
};

export type ValidationError = SFError & {
    fieldType: string;
};
