import EcontextElement from './components/Econtext';
import CardElement from './components/Card';
import RedirectElement from './components/Redirect';
import createComponent from './create-component.umd';

describe('createComponent', () => {
    test('should create Card', () => {
        const component = createComponent('card', {
            core: global.core
        });
        expect(component.type).toBe('card');
        expect(component).toBeInstanceOf(CardElement);
    });

    test('should create Econtext with right paymentType', () => {
        const econtextSevenEleven = createComponent('econtext_seven_eleven', {
            core: global.core
        });
        expect(econtextSevenEleven.type).toBe('econtext_seven_eleven');
        expect(econtextSevenEleven).toBeInstanceOf(EcontextElement);

        const econtextAtm = createComponent('econtext_atm', {
            core: global.core
        });
        expect(econtextAtm.type).toBe('econtext_atm');
        expect(econtextAtm).toBeInstanceOf(EcontextElement);
    });

    test('should create Redirect', () => {
        const component = createComponent('paybright', {
            core: global.core
        });
        expect(component.type).toBe('paybright');
        expect(component).toBeInstanceOf(RedirectElement);
    });

    test('should throw Error if paymentType is not passed', () => {
        expect(() => createComponent('', { core: global.core })).toThrow();
    });

    test('should throw Error if paymentType is dropin', () => {
        expect(() => createComponent('dropin', { core: global.core })).toThrow();
    });
});
