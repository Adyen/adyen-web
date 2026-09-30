import { mapKlarnaAddressToAdyen, mapKlarnaShippingOptionToAdyen, mapShippingUpdateToKlarna } from './klarna-mappers';
import type { KlarnaNetworkShippingUpdate } from '../types';

const AMOUNT = { value: 26400, currency: 'USD' };

describe('klarna-mappers', () => {
    describe('mapShippingUpdateToKlarna', () => {
        test('should map the amount to Klarna amount and currency', () => {
            expect(mapShippingUpdateToKlarna({ amount: AMOUNT })).toEqual({ amount: 26400, currency: 'USD' });
        });

        test('should map every line item field', () => {
            const update: KlarnaNetworkShippingUpdate = {
                amount: AMOUNT,
                lineItems: [
                    {
                        id: 'item-1',
                        sku: 'sku-1',
                        description: 'Sneakers',
                        quantity: 1,
                        amountIncludingTax: 12100,
                        amountExcludingTax: 10000,
                        taxAmount: 2100,
                        taxPercentage: 2100,
                        imageUrl: 'https://example.com/image.png',
                        productUrl: 'https://example.com/product'
                    }
                ]
            };

            expect(mapShippingUpdateToKlarna(update).lineItems).toEqual([
                {
                    reference: 'item-1',
                    name: 'Sneakers',
                    quantity: 1,
                    unitPrice: 12100,
                    totalAmount: 12100,
                    totalTaxAmount: 2100,
                    taxRate: 2100,
                    imageUrl: 'https://example.com/image.png',
                    productUrl: 'https://example.com/product'
                }
            ]);
        });

        test('should multiply total amount and total tax amount by the quantity', () => {
            const [item] =
                mapShippingUpdateToKlarna({
                    amount: AMOUNT,
                    lineItems: [{ description: 'Socks', quantity: 3, amountIncludingTax: 6900, taxAmount: 900 }]
                }).lineItems ?? [];

            expect(item.totalAmount).toBe(20700);
            expect(item.totalTaxAmount).toBe(2700);
            expect(item.unitPrice).toBe(6900);
        });

        test('should fall back to the sku as reference when there is no id', () => {
            const [item] =
                mapShippingUpdateToKlarna({
                    amount: AMOUNT,
                    lineItems: [{ sku: 'sku-2', description: 'Socks', quantity: 1, amountIncludingTax: 100 }]
                }).lineItems ?? [];

            expect(item.reference).toBe('sku-2');
        });

        test('should omit optional line item fields when they are missing', () => {
            const [item] =
                mapShippingUpdateToKlarna({
                    amount: AMOUNT,
                    lineItems: [{ description: 'Socks', quantity: 1, amountIncludingTax: 100 }]
                }).lineItems ?? [];

            expect(item).toEqual({ name: 'Socks', quantity: 1, unitPrice: 100, totalAmount: 100, totalTaxAmount: 0 });
        });

        test('should map delivery methods to shipping options', () => {
            const result = mapShippingUpdateToKlarna({
                amount: AMOUNT,
                deliveryMethods: [
                    { reference: 'standard', description: 'Standard', type: 'Shipping', amount: { value: 500, currency: 'USD' }, selected: false },
                    { reference: 'express', description: 'Express', type: 'Shipping', amount: { value: 1599, currency: 'USD' }, selected: true }
                ]
            });

            expect(result.shippingOptions).toEqual([
                { shippingOptionReference: 'standard', displayName: 'Standard', amount: 500, shippingType: 'TO_DOOR' },
                { shippingOptionReference: 'express', displayName: 'Express', amount: 1599, shippingType: 'TO_DOOR' }
            ]);
            expect(result.selectedShippingOptionReference).toBe('express');
        });

        test('should not set a selected shipping option when none is selected', () => {
            const result = mapShippingUpdateToKlarna({
                amount: AMOUNT,
                deliveryMethods: [{ reference: 'standard', description: 'Standard', amount: { value: 500, currency: 'USD' } }]
            });

            expect(result).not.toHaveProperty('selectedShippingOptionReference');
        });
    });

    describe('mapKlarnaAddressToAdyen', () => {
        test('should map every Klarna address field to the Adyen address format', () => {
            expect(
                mapKlarnaAddressToAdyen({
                    givenName: 'Jane',
                    familyName: 'Doe',
                    streetAddress: '1 Main St',
                    streetAddress2: 'Apt 2',
                    postalCode: '10001',
                    city: 'New York',
                    region: 'NY',
                    country: 'US'
                })
            ).toEqual({
                street: '1 Main St',
                houseNumberOrName: 'Apt 2',
                postalCode: '10001',
                city: 'New York',
                stateOrProvince: 'NY',
                country: 'US'
            });
        });

        test('should omit fields Klarna did not send', () => {
            expect(mapKlarnaAddressToAdyen({ country: 'CA' })).toEqual({ country: 'CA' });
            expect(mapKlarnaAddressToAdyen(undefined)).toEqual({});
        });
    });

    describe('mapKlarnaShippingOptionToAdyen', () => {
        test('should map a Klarna shipping option to an Adyen delivery method', () => {
            expect(
                mapKlarnaShippingOptionToAdyen(
                    { shippingOptionReference: 'express', displayName: 'Express', amount: 1599, shippingType: 'TO_DOOR' },
                    'USD'
                )
            ).toEqual({ reference: 'express', description: 'Express', amount: { value: 1599, currency: 'USD' } });
        });
    });
});
