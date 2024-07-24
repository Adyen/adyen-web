import { h } from 'preact';
import { mount } from 'enzyme';
import Installments from './Installments';
import { InstallmentOptions } from '../types';
import { render, screen } from '@testing-library/preact';
import { CoreProvider } from '../../../../../../core/Context/CoreProvider';

describe('Installments', () => {
    let installmentOptions;
    const getWrapper = (props = {}) =>
        mount(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <Installments installmentOptions={installmentOptions} {...props} />{' '}
            </CoreProvider>
        );

    beforeEach(() => {
        installmentOptions = {
            card: {
                values: [1, 2]
            },
            mc: {
                values: [1, 2, 3]
            },
            visa: {
                values: [1, 2, 3, 4]
            }
        } as InstallmentOptions;
    });

    test('renders the installment options', () => {
        const wrapper = getWrapper();
        expect(wrapper.find('Installments')).toHaveLength(1);
    });

    test('does not render any installment options if the passed amount is 0', () => {
        const amount = { value: 0, currency: 'EUR' };
        const wrapper = getWrapper({ amount });
        expect(wrapper.find('.adyen-checkout__dropdown__element')).toHaveLength(0);
    });

    test('does not render any installment options by default when no card key is passed', () => {
        delete installmentOptions.card;
        const wrapper = getWrapper({ installmentOptions });
        expect(wrapper.find('.adyen-checkout__dropdown__element')).toHaveLength(0);
    });

    test('renders the select as read only if only one option is passed', () => {
        installmentOptions.card.values = [3];
        const wrapper = getWrapper({ installmentOptions });
        expect(wrapper.find('Select').prop('readonly')).toBe(true);
    });

    test('preselects the passed value', () => {
        installmentOptions.card.preselectedValue = 2;
        const wrapper = getWrapper({ installmentOptions });
        // TODO: This test should be migrated to react test library instead of reading form props
        expect(wrapper.find('Select').prop('selectedValue')).toBe(2);
    });

    test('preselect the first if the preselectedValue is not provided', async () => {
        const amount = { value: 30000, currency: 'USD' };
        const props = { amount, installmentOptions, type: 'amount' };

        render(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                <Installments {...props} />
            </CoreProvider>
        );
        expect(await screen.findByRole('button')).toHaveTextContent('1x $300.00');
        expect(await screen.findByText('Number of installments')).toBeTruthy();
    });

    describe('On brand change', () => {
        let amount;
        let type;
        beforeEach(() => {
            amount = { value: 30000, currency: 'USD' };
            type = 'amount';
        });

        describe('New brand supports the installmentAmount', () => {
            test('should keep selecting the current installmentAmount', async () => {
                installmentOptions = {
                    card: {
                        values: [1, 2, 3, 4],
                        preselectedValue: 2
                    },
                    visa: {
                        values: [1, 2]
                    }
                };
                const props = { amount, installmentOptions, type };
                const { rerender } = render(
                    <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                        <Installments {...props} />
                    </CoreProvider>
                );
                expect(await screen.findByRole('button')).toHaveTextContent('2x $150.00');
                rerender(
                    <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                        <Installments brand={'visa'} {...props} />{' '}
                    </CoreProvider>
                );
                expect(await screen.findByRole('button')).toHaveTextContent('2x $150.00');
            });
        });

        describe('New brand does not support the installmentAmount', () => {
            test('should preselect the preselectedValue if provided', async () => {
                installmentOptions = {
                    card: {
                        values: [1, 2, 3, 4],
                        preselectedValue: 4
                    },
                    visa: {
                        values: [1, 2],
                        preselectedValue: 2
                    }
                };
                const props = { amount, installmentOptions, type };
                const { rerender } = render(
                    <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                        <Installments {...props} />
                    </CoreProvider>
                );
                expect(await screen.findByRole('button')).toHaveTextContent('4x $75.00');
                rerender(
                    <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                        <Installments brand={'visa'} {...props} />
                    </CoreProvider>
                );
                expect(await screen.findByRole('button')).toHaveTextContent('2x $150.00');
            });

            test('should preselect the first installments', async () => {
                installmentOptions = {
                    card: {
                        values: [1, 2, 3, 4],
                        preselectedValue: 4
                    },
                    visa: {
                        values: [1, 2]
                    }
                };
                const props = { amount, installmentOptions, type };
                const { rerender } = render(
                    <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                        <Installments {...props} />
                    </CoreProvider>
                );
                expect(await screen.findByRole('button')).toHaveTextContent('4x $75.00');
                rerender(
                    <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                        <Installments brand={'visa'} {...props} />
                    </CoreProvider>
                );
                expect(await screen.findByRole('button')).toHaveTextContent('1x $300.00');
            });
        });
    });

    test('renders the right amount of installment options', () => {
        // card
        expect(getWrapper().find('.adyen-checkout__dropdown__element')).toHaveLength(2);

        expect(getWrapper({ brand: 'mc' }).find('.adyen-checkout__dropdown__element')).toHaveLength(3);
        expect(getWrapper({ brand: 'visa' }).find('.adyen-checkout__dropdown__element')).toHaveLength(4);
    });

    test('renders the radio button UI', () => {
        installmentOptions.visa.plans = ['regular', 'revolving'];

        // containing div - not present 'cos no brand is set
        expect(getWrapper().find('.adyen-checkout__fieldset--revolving-plan')).toHaveLength(0);

        const wrapper = getWrapper({ brand: 'visa' });
        // containing div - once brand is set
        expect(wrapper.find('.adyen-checkout__fieldset--revolving-plan')).toHaveLength(1);
        // radio buttons
        expect(wrapper.find('.adyen-checkout__radio_group__input')).toHaveLength(3);
        // dropdown
        expect(wrapper.find('.adyen-checkout__dropdown__element')).toHaveLength(4);
    });

    test('does not render the radio button UI for mc', () => {
        const wrapper = getWrapper({ brand: 'mc' });
        // no containing div
        expect(wrapper.find('.adyen-checkout__fieldset--revolving-plan')).toHaveLength(0);
        // no radio buttons
        expect(wrapper.find('.adyen-checkout__radio_group__input')).toHaveLength(0);

        // dropdown
        expect(wrapper.find('.adyen-checkout__dropdown__element')).toHaveLength(3);
    });
});
