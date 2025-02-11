import { MetaConfiguration, StoryConfiguration } from '../types';
import { VoucherConfiguration } from '../../../src/components/types';
import { ComponentContainer } from '../ComponentContainer';
import Boleto from '../../../src/components/Boleto';
import { Checkout } from '../Checkout';

type BoletoStory = StoryConfiguration<VoucherConfiguration>;

const meta: MetaConfiguration<VoucherConfiguration> = {
    title: 'Vouchers/Boleto'
};

export const Default: BoletoStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => (
                <ComponentContainer
                    element={
                        new Boleto(checkout, {
                            ...componentConfiguration,
                            data: {
                                firstName: 'José',
                                lastName: 'Silva',
                                billingAddress: {
                                    city: 'São Paulo',
                                    country: 'BR',
                                    houseNumberOrName: '952',
                                    postalCode: '04386040',
                                    stateOrProvince: 'SP',
                                    street: 'Rua Funcionarios'
                                },
                                socialSecurityNumber: '56861752509',
                                shopperEmail: 'joses@test.com'
                            }
                        })
                    }
                />
            )}
        </Checkout>
    ),

    args: {
        countryCode: 'BR'
    }
};

export default meta;
