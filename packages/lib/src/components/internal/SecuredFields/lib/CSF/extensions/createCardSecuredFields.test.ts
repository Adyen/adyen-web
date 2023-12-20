import { createCardSecuredFields, createNonCardSecuredFields } from './createSecuredFields';
import { DATA_ENCRYPTED_FIELD_ATTR, ENCRYPTED_CARD_NUMBER } from '../../configuration/constants';
import { SecuredFields } from '../../types';
import SecuredField from '../../securedField/SecuredField';

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

jest.mock('../../securedField/SecuredField');

const mockedSecuredField = SecuredField as jest.Mock;

window._b$dl = true; // to cover some missing lines

let MySecuredField;

const makeDiv = encName => {
    const myDiv = document.createElement('div');
    myDiv.setAttribute(DATA_ENCRYPTED_FIELD_ATTR, encName);
    return myDiv;
};

const myCSF = {
    state: { type: 'card', securedFields: {} as SecuredFields },
    config: { cardGroupTypes: ['mc'] },
    props: {},
    callbacks: {
        onBrand: jest.fn(() => {})
    },
    setupSecuredField: () => Promise.resolve(),
    createCardSecuredFields,
    createNonCardSecuredFields,
    isSingleBrandedCard: null
};

describe("Testing setupSecuredField's createCardSecuredFields functionality", () => {
    beforeEach(() => {
        console.log = jest.fn(() => {});

        MySecuredField = {
            fieldType: ENCRYPTED_CARD_NUMBER
        };
        const SecuredFieldMock = jest.fn(() => MySecuredField);

        mockedSecuredField.mockReset();
        mockedSecuredField.mockImplementation(() => SecuredFieldMock());
        SecuredFieldMock.mockClear();
    });

    test("setupSecuredField's createCardSecuredFields function, as a single-branded card, should call the onBrand callback", async () => {
        myCSF.state.type = 'mc';
        myCSF.isSingleBrandedCard = true;

        myCSF.setupSecuredField = () => Promise.resolve();

        const myDiv = makeDiv(ENCRYPTED_CARD_NUMBER);
        await myCSF.createCardSecuredFields([myDiv], 'required', 'required');

        // Fast-forward until related timer has been executed
        jest.runAllTimers();

        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 0);

        expect(myCSF.callbacks.onBrand).toHaveBeenCalled();
    });

    test("setupSecuredField's createNonCardSecuredFields function should resolve", async () => {
        const myDiv = makeDiv(ENCRYPTED_CARD_NUMBER);
        await expect(myCSF.createNonCardSecuredFields([myDiv])).resolves.toBe(undefined);
    });
});
