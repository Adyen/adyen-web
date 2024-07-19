import { filterPresent, filterAvailable, optionallyFilterUpiSubTxVariants } from './filters';
import { mock } from 'jest-mock-extended';
import UIElement from '../../internal/UIElement/UIElement';

describe('Elements filters', () => {
    describe('filterPresent', () => {
        test('should return true if the paymentMethod is truthy', () => {
            expect(filterPresent({})).toBe(true);
            expect(filterPresent(true)).toBe(true);
        });

        test('should return false if the paymentMethod is not truthy', () => {
            expect(filterPresent(undefined)).toBe(false);
        });
    });

    describe('filterAvailable()', () => {
        test('should return the available UIElements', async () => {
            const elements = [
                mock<UIElement>({
                    isAvailable(): Promise<void> {
                        return Promise.resolve();
                    }
                }),
                mock<UIElement>({
                    isAvailable(): Promise<void> {
                        return Promise.reject();
                    }
                }),
                mock<UIElement>({
                    isAvailable(): Promise<void> {
                        return Promise.reject();
                    }
                }),
                mock<UIElement>({
                    isAvailable(): Promise<void> {
                        return Promise.resolve();
                    }
                })
            ];

            const filteredElements = await filterAvailable(elements);

            expect(filteredElements.length).toBe(2);
            expect(filteredElements[0]).toBe(elements[0]);
            expect(filteredElements[1]).toBe(elements[3]);
        });

        test('should return empty array if no element is valid', async () => {
            const elements = [
                mock<UIElement>({
                    isAvailable(): Promise<void> {
                        return Promise.reject();
                    }
                })
            ];
            const filteredElements = await filterAvailable(elements);
            expect(filteredElements.length).toBe(0);
        });
    });

    describe('optionallyFilterUpiSubTxVariants', () => {
        test('should filter out the other upi children pms, if the upi parent type presents', () => {
            expect(
                optionallyFilterUpiSubTxVariants([
                    { type: 'upi', name: 'UPI' },
                    { type: 'upi_intent', name: 'UPI Intent' }
                ])
            ).toEqual([{ type: 'upi', name: 'UPI' }]);
        });

        test('should return all pms, if the upi parent type does not present', () => {
            expect(
                optionallyFilterUpiSubTxVariants([
                    { type: 'scheme', name: 'Card' },
                    { type: 'upi_intent', name: 'UPI Intent' },
                    { type: 'upi_collect', name: 'UPI Collect' }
                ])
            ).toEqual([
                { type: 'scheme', name: 'Card' },
                { type: 'upi_intent', name: 'UPI Intent' },
                { type: 'upi_collect', name: 'UPI Collect' }
            ]);
        });
    });
});
