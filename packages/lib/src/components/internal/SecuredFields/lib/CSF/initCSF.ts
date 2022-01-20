import CSF from './CSF';
import cardType from '../utilities/cardType';
import * as logger from '../utilities/logger';
import { falsy } from '../utilities/commonUtils';
import { CSFReturnObject, CSFSetupObject } from './types';
import { hasOwnProperty } from '../../../../../utils/hasOwnProperty';
import { selectOne } from '../utilities/dom';

const initCSF = (pSetupObj: CSFSetupObject): CSFReturnObject => {
    if (!pSetupObj) {
        throw new Error('No securedFields configuration object defined');
    }

    const setupObj: CSFSetupObject = { ...pSetupObj };

    // Ensure there is always a default type & map the generic types (e.g. 'card', 'scheme') to 'card'
    const isGenericCardType: boolean = cardType.isGenericCardType(setupObj.type);
    setupObj.type = isGenericCardType ? 'card' : setupObj.type;

    // //////// 1. Check passed config object has minimum expected properties //////////
    if (!hasOwnProperty(setupObj, 'rootNode')) {
        logger.error('ERROR: SecuredFields configuration object is missing a "rootNode" property');
        return null;
    }

    if (falsy(setupObj.clientKey)) {
        logger.warn('WARNING: AdyenCheckout configuration object is missing a "clientKey" property.');
        return null;
    }

    //----------------------------------------------------------------------------

    // //////// 2. Find and store reference to the root DOM element //////////
    const rootNode: HTMLElement = findRootNode(setupObj.rootNode);

    if (!rootNode) {
        if (window.console && window.console.error) {
            window.console.error('ERROR: SecuredFields cannot find a valid rootNode element for', setupObj.type);
        }
        return null;
    }

    setupObj.rootNode = rootNode; // Overwrite with actual node (in case we were sent a string)

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
