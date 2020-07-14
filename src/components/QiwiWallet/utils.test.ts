import { formatPrefixName, selectItem } from './utils';

describe('formatPrefixName', () => {
    const emptyItem = undefined;

    test('throws new error when passing nothing', () => {
        expect(() => formatPrefixName(emptyItem)).toThrow('No item passed');
    });

    const noIdItem = {
        id: undefined,
        name: 'test'
    };

    const noNameItem = {
        id: '22',
        name: undefined
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
        name: 'nl'
    };

    test('Formats items and adjusts the name', () => {
        const returnedItem = formatPrefixName(item);
        expect(returnedItem.name).toContain('nl (+31)');
    });
});

describe('selectItem', () => {
    const itemList = [
        {
            id: '+7',
            name: 'RU'
        },
        {
            id: '+9955',
            name: 'GE'
        },
        {
            id: '+507',
            name: 'PA'
        },
        {
            id: '+44',
            name: 'GB'
        },
        {
            id: '+992',
            name: 'TJ'
        },
        {
            id: '+370',
            name: 'LT'
        },
        {
            id: '+972',
            name: 'IL'
        },
        {
            id: '+996',
            name: 'KG'
        },
        {
            id: '+380',
            name: 'UA'
        },
        {
            id: '+84',
            name: 'VN'
        },
        {
            id: '+90',
            name: 'TR'
        },
        {
            id: '+994',
            name: 'AZ'
        },
        {
            id: '+374',
            name: 'AM'
        },
        {
            id: '+371',
            name: 'LV'
        },
        {
            id: '+91',
            name: 'IN'
        },
        {
            id: '+66',
            name: 'TH'
        },
        {
            id: '+373',
            name: 'MD'
        },
        {
            id: '+1',
            name: 'US'
        },
        {
            id: '+81',
            name: 'JP'
        },
        {
            id: '+998',
            name: 'UZ'
        },
        {
            id: '+77',
            name: 'KZ'
        },
        {
            id: '+375',
            name: 'BY'
        },
        {
            id: '+372',
            name: 'EE'
        },
        {
            id: '+40',
            name: 'RO'
        },
        {
            id: '+82',
            name: 'KR'
        }
    ];

    test('returns item based on matching id and name', () => {
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
