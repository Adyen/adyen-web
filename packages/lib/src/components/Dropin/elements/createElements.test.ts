import createElements from './createElements';
import Card from '../../Card/Card';

import type { ICore } from '../../../core/types';
import type { _MockProxy } from 'jest-mock-extended/lib/Mock';
import { PaymentMethod } from '../../../core/ProcessResponse/PaymentMethods/PaymentMethods';
import uuidv4 from '../../../utils/uuid';

describe('Drop-in: createElements', () => {
    test('should filter out non-supported payment methods before attempting to create the payment method components', async () => {
        const paymentMethods: PaymentMethod[] = [
            {
                _id: uuidv4(),
                type: 'scheme',
                name: 'Cards',
                brands: []
            },
            {
                _id: uuidv4(),
                type: 'clicktopay',
                name: 'Click to Pay',
                configuration: {
                    visaSrcInitiatorId: 'B9SECVKI...',
                    visaSrciDpaId: '8e6e347c-25...'
                }
            },
            {
                _id: uuidv4(),
                type: 'androidpay',
                name: 'AndroidPay'
            }
        ];

        const core = global.core as _MockProxy<ICore> & ICore;
        core.getComponent.mockImplementation((type: string) => {
            if (type === 'scheme') {
                return Card;
            }
        });

        const elements = await createElements(paymentMethods, {}, {}, core);

        expect(core.getComponent).toHaveBeenCalledTimes(1);
        expect(core.getComponent).toHaveBeenCalledWith('scheme');
        expect(elements.length).toBe(1);
        expect(elements[0]).toBeInstanceOf(Card);
    });
});
