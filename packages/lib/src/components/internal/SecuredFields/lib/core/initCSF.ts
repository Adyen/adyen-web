import CSF from './CSF';
import cardType from '../utilities/cardType';
import { falsy } from '../utilities/commonUtils';
import { findRootNode } from '../ui/domUtils';
import { CSFReturnObject, SetupObject } from '../types';
import { ERROR_CODES, ERROR_MSG_NO_KEYS } from '../../../../../core/Errors/constants';

const initCSF = (pSetupObj: SetupObject, highLevelErrorHandler): CSFReturnObject => {
    const setupObj: SetupObject = { ...pSetupObj };

    // Ensure there is always a default type & map the generic types (e.g. 'card', 'scheme') to 'card'
    const isGenericCardType: boolean = cardType.isGenericCardType(setupObj.type);
    setupObj.type = isGenericCardType ? 'card' : setupObj.type;

    if (falsy(setupObj.clientKey) && falsy(setupObj.originKey)) {
        highLevelErrorHandler({ error: ERROR_CODES[ERROR_MSG_NO_KEYS] });
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

export default initCSF;
