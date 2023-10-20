import createComponentFromTxVariant from './create-component.umd';
import EcontextElement from './components/Econtext';
import CardElement from './components/Card';
import RedirectElement from './components/Redirect';

describe('createComponentFromTxVariant', () => {
    test('should create Card', () => {
        const component = createComponentFromTxVariant('card', {
            core: global.core
        });
        expect(component.type).toBe('card');
        expect(component).toBeInstanceOf(CardElement);
    });

    test('should create Econtext with right txVariant', () => {
        const econtextSevenEleven = createComponentFromTxVariant('econtext_seven_eleven', {
            core: global.core
        });
        expect(econtextSevenEleven.type).toBe('econtext_seven_eleven');
        expect(econtextSevenEleven).toBeInstanceOf(EcontextElement);

        const econtextAtm = createComponentFromTxVariant('econtext_atm', {
            core: global.core
        });
        expect(econtextAtm.type).toBe('econtext_atm');
        expect(econtextAtm).toBeInstanceOf(EcontextElement);
    });

    test('should create Redirect', () => {
        const component = createComponentFromTxVariant('paybright', {
            core: global.core
        });
        expect(component.type).toBe('paybright');
        expect(component).toBeInstanceOf(RedirectElement);
    });

    test('should throw Error if txVariant is not passed', () => {
        expect(() => createComponentFromTxVariant('', { core: global.core })).toThrow();
    });

    test('should throw Error if txVariant is dropin', () => {
        expect(() => createComponentFromTxVariant('dropin', { core: global.core })).toThrow();
    });
});
