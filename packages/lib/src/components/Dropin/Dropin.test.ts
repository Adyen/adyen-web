import { mount } from 'enzyme';
import Dropin from './Dropin';

describe('Dropin', () => {
    describe('isValid', () => {
        test('should fail if no activePaymentMethod', () => {
            const dropin = new Dropin({});
            mount(dropin.render());

            expect(dropin.isValid).toEqual(false);
        });

        test('should return the isValid value of the activePaymentMethod', () => {
            const dropin = new Dropin({});
            mount(dropin.render());
            dropin.dropinRef.state.activePaymentMethod = { isValid: true };
            expect(dropin.isValid).toEqual(true);
        });
    });

    describe('submit', () => {
        test('should fail if no activePaymentMethod', () => {
            const dropin = new Dropin({});
            expect(() => dropin.submit()).toThrow();
        });
    });

    describe('closeActivePaymentMethod', () => {
        test('should close active payment method', () => {
            const dropin = new Dropin({});
            mount(dropin.render());
            expect(dropin.dropinRef.state.activePaymentMethod).toBeDefined();

            dropin.closeActivePaymentMethod();
            expect(dropin.dropinRef.state.activePaymentMethod).toBeNull();
        });
    });
});
