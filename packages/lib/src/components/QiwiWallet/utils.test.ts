import { formatPrefixName, selectItem } from './utils';

describe('formatPrefixName', () => {
    const emptyItem = undefined;

    test('throws new error when passing nothing', () => {
        expect(() => formatPrefixName(emptyItem)).toThrow('No item passed');
    });

    const noIdItem = {
        id: undefined,
        code: 'test'
    };

    const noNameItem = {
        id: '22',
        code: undefined
    };

    test('Returns formatted name as string when passed with an item without ID ', () => {
        const noIdResult = formatPrefixName(noIdItem);
        expect(noIdResult).toEqual(false);
    });

    test('Returns formatted name as string when passed with an item without ID ', () => {
        const noNameResult = formatPrefixName(noNameItem);
        expect(noNameResult).toEqual(false);
    });

    const item = {
        id: '+31',
        code: 'NL'
    };

    test('Formats items and adjusts the name', () => {
        const returnedItem = formatPrefixName(item);
        expect(returnedItem.name).toContain('🇳🇱 +31 (NL)');
    });
});

describe('selectItem', () => {
    const itemList = [
        {
            id: '+7',
            code: 'RU'
        },
        {
            id: '+9955',
            code: 'GE'
        },
        {
            id: '+507',
            code: 'PA'
        },
        {
            id: '+44',
            code: 'GB'
        },
        {
            id: '+992',
            code: 'TJ'
        },
        {
            id: '+370',
            code: 'LT'
        },
        {
            id: '+972',
            code: 'IL'
        },
        {
            id: '+996',
            code: 'KG'
        },
        {
            id: '+380',
            code: 'UA'
        },
        {
            id: '+84',
            code: 'VN'
        },
        {
            id: '+90',
            code: 'TR'
        },
        {
            id: '+994',
            code: 'AZ'
        },
        {
            id: '+374',
            code: 'AM'
        },
        {
            id: '+371',
            code: 'LV'
        },
        {
            id: '+91',
            code: 'IN'
        },
        {
            id: '+66',
            code: 'TH'
        },
        {
            id: '+373',
            code: 'MD'
        },
        {
            id: '+1',
            code: 'US'
        },
        {
            id: '+81',
            code: 'JP'
        },
        {
            id: '+998',
            code: 'UZ'
        },
        {
            id: '+77',
            code: 'KZ'
        },
        {
            id: '+375',
            code: 'BY'
        },
        {
            id: '+372',
            code: 'EE'
        },
        {
            id: '+40',
            code: 'RO'
        },
        {
            id: '+82',
            code: 'KR'
        }
    ];

    test('returns item based on matching id and code', () => {
        const selectedItemKR = selectItem(itemList, 'KR');
        expect(selectedItemKR).toBe('+82');

        const selectedItemEE = selectItem(itemList, 'EE');
        expect(selectedItemEE).toBe('+372');

        const selectedItemNL = selectItem(itemList, 'NL');
        expect(selectedItemNL).toBe(false);
    });

    test('Returns false when no item is passed', () => {
        const noItem = selectItem(itemList, null);
        expect(noItem).toBe(false);
    });
});
