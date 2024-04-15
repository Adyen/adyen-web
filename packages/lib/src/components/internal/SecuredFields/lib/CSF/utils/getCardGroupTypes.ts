import { isArray } from '../../utilities/commonUtils';
import { DEFAULT_CARD_GROUP_TYPES } from '../../constants';

export const getCardGroupTypes = (cardGroupTypes?): string[] =>
    isArray(cardGroupTypes) && cardGroupTypes.length ? cardGroupTypes : DEFAULT_CARD_GROUP_TYPES;
