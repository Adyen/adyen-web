import { handleConfig } from './handleConfig';
import { CSFConfigObject, CSFSetupObject } from '../types';
import { SF_VERSION } from '../../constants';

const myConfig: CSFConfigObject = {
    iframeSrc: '',
    isCreditCardType: false,
    sfLogAtStart: false,
    loadingContext: ''
};

const myHandleConfig = handleConfig.bind({
    config: myConfig
});

let props: CSFSetupObject;

describe('Testing the config values that handleConfig generates when based different props', () => {
    beforeEach(() => {
        // console.log = jest.fn(() => {});

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
            forceCompat: false,
            useModern: false
        };
    });

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

    test('With useModern set to true, iframeSrc should point to the compat bundle', () => {
        props.useModern = true;

        myHandleConfig(props);

        const d = btoa(window.location.origin);

        const bundleType = 'cardModern';

        expect(myConfig.iframeSrc).toEqual(
            `${props.loadingContext}securedfields/${props.clientKey}/${SF_VERSION}/securedFields.html?type=${bundleType}&d=${d}`
        );
    });

    test('With forceCompat set to true, but also useModern set to true, iframeSrc should point to the modern bundle', () => {
        props.forceCompat = true;
        props.useModern = true;

        myHandleConfig(props);

        const d = btoa(window.location.origin);

        const bundleType = 'cardModern';

        expect(myConfig.iframeSrc).toEqual(
            `${props.loadingContext}securedfields/${props.clientKey}/${SF_VERSION}/securedFields.html?type=${bundleType}&d=${d}`
        );
    });
});
