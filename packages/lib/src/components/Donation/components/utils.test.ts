import { getDonationComponent } from './utils';
import type { ICore } from '../../../core/types';

describe('getDonationComponent', () => {
    test('should return the component when core.getComponent returns a valid component', () => {
        const mockDonationClass = class MockDonation {};
        const mockCore = {
            getComponent: jest.fn().mockReturnValue(mockDonationClass)
        } as unknown as ICore;

        const result = getDonationComponent('donation', mockCore);

        expect(mockCore.getComponent).toHaveBeenCalledWith('donation');
        expect(result).toBe(mockDonationClass);
    });

    test('should return null when core.getComponent returns undefined', () => {
        const mockCore = {
            getComponent: jest.fn().mockReturnValue(undefined)
        } as unknown as ICore;

        const result = getDonationComponent('donation', mockCore);

        expect(mockCore.getComponent).toHaveBeenCalledWith('donation');
        expect(result).toBeNull();
    });
});
