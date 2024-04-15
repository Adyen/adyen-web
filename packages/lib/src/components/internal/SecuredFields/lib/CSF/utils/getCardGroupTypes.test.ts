import { DEFAULT_CARD_GROUP_TYPES } from '../../constants';
import { getCardGroupTypes } from './getCardGroupTypes';

beforeEach(() => {
    console.error = jest.fn(error => {
        throw new Error(error);
    });
    console.log = jest.fn(() => {});
});

describe('Checks the routine for reading/generating the cardGroupTypes (card brands) that the securedFields will recognise', () => {
    test('Should return default set of cardGroupTypes, since no array is passed', () => {
        const cardGroupTypes = getCardGroupTypes();

        expect(cardGroupTypes).toEqual(DEFAULT_CARD_GROUP_TYPES);
    });

    test('Should return default set of cardGroupTypes, since an empty array is passed', () => {
        const cardGroupTypes = getCardGroupTypes([]);

        expect(cardGroupTypes).toEqual(DEFAULT_CARD_GROUP_TYPES);
    });

    test('Should return default set of cardGroupTypes, since an object is passed, not an array', () => {
        const cardGroupTypes = getCardGroupTypes({ cardGroupTypes: ['mc', 'visa'] });

        expect(cardGroupTypes).toEqual(DEFAULT_CARD_GROUP_TYPES);
    });

    test('Should return passed array', () => {
        const cardGroupTypesArr = ['laser', 'elo'];

        const cardGroupTypes = getCardGroupTypes(cardGroupTypesArr);

        expect(cardGroupTypes).toEqual(cardGroupTypesArr);
    });
});
