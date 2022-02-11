import { t, Selector } from 'testcafe';

export default class InstallmentsComponent {
    constructor(baseEl = 'div.adyen-checkout__installments') {
        this.baseEl = Selector(baseEl).with({ timeout: 0 });

        this.radioButtonOneTimeInstallment = this.baseEl.find('.adyen-checkout__radio_group__input[value=onetime]');
        this.radioButtonInstallments = this.baseEl.find('.adyen-checkout__radio_group__input[value=installments]');
        this.radioButtonRevolving = this.baseEl.find('.adyen-checkout__radio_group__input[value=revolving]');

        this.installmentsButton = this.baseEl.find('.adyen-checkout__dropdown__button');
    }

    async selectInstallment(numberOfInstallment) {
        await t.click(this.radioButtonInstallments);
        await t.click(this.installmentsButton);
        const item = this.baseEl.find(`ul > li.adyen-checkout__dropdown__element[data-value="${numberOfInstallment}"]`);
        await t.click(item);
    }

    async selectRevolving() {
        await t.click(this.radioButtonRevolving);
    }
}
