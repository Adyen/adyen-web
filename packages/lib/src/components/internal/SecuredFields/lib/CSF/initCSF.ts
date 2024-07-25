import CSF from './CSF';
import cardType from './utils/cardType';
import * as logger from '../utilities/logger';
import { falsy } from '../../../../../utils/commonUtils';
import { CSFReturnObject, CSFSetupObject } from './types';
import { hasOwnProperty } from '../../../../../utils/hasOwnProperty';
import { selectOne } from '../utilities/dom';

const initCSF = (pSetupObj: CSFSetupObject): CSFReturnObject => {
    if (!pSetupObj) {
        throw new Error('No securedFields configuration object defined');
    }

    const setupObj: CSFSetupObject = { ...pSetupObj };

    try {
        // Map the generic types (i.e. 'card', 'scheme') to 'card'
        const isGenericCardType: boolean = cardType.isGenericCardType(setupObj.type);
        setupObj.type = isGenericCardType ? 'card' : setupObj.type;
    } catch (e) {
        // If type has not been specified - ensure there is a default
        setupObj.type = 'card';
    }

    // //////// 1. Check passed config object has minimum expected properties //////////
    if (!hasOwnProperty(setupObj, 'rootNode')) {
        return logger.error('ERROR: SecuredFields configuration object is missing a "rootNode" property');
    }

    if (falsy(setupObj.clientKey)) {
        return logger.warn('WARNING: AdyenCheckout configuration object is missing a "clientKey" property.');
    }

    //----------------------------------------------------------------------------

    // //////// 2. Find and store reference to the root DOM element //////////
    const rootNode: HTMLElement = findRootNode(setupObj.rootNode);

    if (!rootNode) {
        return logger.error(`ERROR: SecuredFields cannot find a valid rootNode element for ${setupObj.type}`);
    }

    setupObj.rootNode = rootNode; // Overwrite with actual node (in case we were sent a string)

    // //////// 3. Add warning if in development mode and a custom http domain is detected
    const origin = window.location.origin;

    if (
        (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') &&
        origin.indexOf('http') > -1 &&
        origin.indexOf('localhost') === -1 &&
        origin.indexOf('127.0.0.1') === -1
    ) {
        console.warn(
            'WARNING: you are are running from an insecure context:',
            origin,
            '\nCrypto.subtle cannot function in this environment.\nThe only secure contexts under http contain "localhost" or "127.0.0.1" in their url.' +
                '\nSee https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts'
        );
    }

    const myCSF: CSF = new CSF(setupObj);
    return myCSF.createReturnObject();
};

const findRootNode = pRootNode => {
    let rootNode;

    // Expect to be sent the actual html node...
    if (typeof pRootNode === 'object') {
        rootNode = pRootNode;
    }

    if (typeof pRootNode === 'string') {
        // ... but if only sent a string - find it ourselves
        rootNode = selectOne(document, pRootNode);

        if (!rootNode) {
            return null;
        }
    }

    return rootNode;
};

export default initCSF;
