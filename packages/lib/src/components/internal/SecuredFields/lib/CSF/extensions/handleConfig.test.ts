import { handleConfig } from './handleConfig';
import * as logger from '../../utilities/logger';
import { CSFConfigObject, CSFSetupObject } from '../types';
import { SF_VERSION } from '../../constants';

const myConfig: CSFConfigObject = {
    iframeSrc: '',
    isCreditCardType: false,
    sfLogAtStart: false,
    loadingContext: ''
};

const _this = { config: myConfig };

// handleConfig refers to "this.config", so mock the "this" binding
const myHandleConfig = handleConfig.bind(_this);

let props: CSFSetupObject;

describe('Testing the config values that handleConfig generates when based different props', () => {
    beforeEach(() => {
        /* @ts-ignore prefer-const */
        console.warn = logger.warn = jest.fn(() => {});
        console.log = jest.fn(() => {});

        // Reset basic props
        props = {
            type: '',
            clientKey: '',
            rootNode: '',
            showContextualElement: false,
            maskSecurityCode: false,
            exposeExpiryDate: false,
            shouldDisableIOSArrowKeys: false,
            loadingContext: 'checkoutshopper/',
            iframeUIConfig: { foo: 'bar' },
            forceCompat: false
        };
    });

    /**
     * Testing loadingContext
     */
    test('With loadingContext not set, handleConfig should exit, as tested by seeing that props end up undefined rather than having a value set', () => {
        props.loadingContext = '';

        myHandleConfig(props);

        expect(myConfig.iframeUIConfig).toBeUndefined();
    });

    test('With loadingContext set, handleConfig should proceed', () => {
        myHandleConfig(props);

        expect(myConfig.iframeUIConfig).toEqual({ foo: 'bar' });
    });

    /**
     * Testing iframeSrc
     */
    test('With the basic props, iframeSrc should point to the regular bundle', () => {
        myHandleConfig(props);

        const d = btoa(window.location.origin);

        const bundleType = 'card';

        expect(myConfig.iframeSrc).toEqual(
            `${props.loadingContext}securedfields/${props.clientKey}/${SF_VERSION}/securedFields.html?type=${bundleType}&d=${d}`
        );
    });

    test('With forceCompat set to true, iframeSrc should point to the compat bundle', () => {
        props.forceCompat = true;

        myHandleConfig(props);

        const d = btoa(window.location.origin);

        const bundleType = 'cardCompat';

        expect(myConfig.iframeSrc).toEqual(
            `${props.loadingContext}securedfields/${props.clientKey}/${SF_VERSION}/securedFields.html?type=${bundleType}&d=${d}`
        );
    });

    test('With forceCompat set to true, but loadingContext mentioning "live", iframeSrc should point to the regular bundle', () => {
        props.loadingContext = 'checkoutshopper-live/';
        props.forceCompat = true;

        myHandleConfig(props);

        const d = btoa(window.location.origin);

        const bundleType = 'card';

        expect(myConfig.iframeSrc).toEqual(
            `${props.loadingContext}securedfields/${props.clientKey}/${SF_VERSION}/securedFields.html?type=${bundleType}&d=${d}`
        );
    });
});
