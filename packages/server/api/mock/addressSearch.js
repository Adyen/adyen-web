const { post } = require('request');
const handleCallback = require('../../utils/handleCallback');
const { MERCHANT_ACCOUNT: merchantAccount } = require('../../utils/config');

module.exports = (res, request) => {
    const MOCK_ADDRESS_ARRAY = [
        {
            id: 376,
            name: '56 Willow Road, B17 8JA, Birmingham',
            address: 'Willow Road',
            postalCode: 'B17 8JA',
            city: 'Birmingham',
            houseNumber: 56
        },
        {
            id: 992,
            name: '39 Tower Bridge Road, SE1 4TR, London',
            address: 'Tower Bridge Road',
            postalCode: 'SE1 4TR',
            city: 'London',
            houseNumber: 39
        },
        {
            id: 185,
            name: '15 Winchester Avenue, M20 6RD, Manchester',
            address: 'Winchester Avenue',
            postalCode: 'M20 6RD',
            city: 'Manchester',
            houseNumber: 15
        },
        {
            id: 823,
            name: '5 Victoria Road, LS6 1PF, Leeds',
            address: 'Victoria Road',
            postalCode: 'LS6 1PF',
            city: 'Leeds',
            houseNumber: 5
        },
        {
            id: 664,
            name: '2 Edinburgh Road, G64 2LY, Glasgow',
            address: 'Edinburgh Road',
            postalCode: 'G64 2LY',
            city: 'Glasgow',
            houseNumber: 2
        },
        {
            id: 927,
            name: '12 York Street, BS2 8QH, Bristol',
            address: 'York Street',
            postalCode: 'BS2 8QH',
            city: 'Bristol',
            houseNumber: 12
        },
        {
            id: 340,
            name: '31 Queens Road, L18 9PE, Liverpool',
            address: 'Queens Road',
            postalCode: 'L18 9PE',
            city: 'Liverpool',
            houseNumber: 31
        },
        {
            id: 581,
            name: '22 York Road, NE1 5DL, Newcastle',
            address: 'York Road',
            postalCode: 'NE1 5DL',
            city: 'Newcastle',
            houseNumber: 22
        },
        {
            id: 709,
            name: '8 Church Lane, NG7 1QJ, Nottingham',
            address: 'Church Lane',
            postalCode: 'NG7 1QJ',
            city: 'Nottingham',
            houseNumber: 8
        },
        {
            id: 117,
            name: '47 Oxford Street, CB1 1EP, Cambridge',
            address: 'Oxford Street',
            postalCode: 'CB1 1EP',
            city: 'Cambridge',
            houseNumber: 47
        }
    ];

    //TODO:
    // 1. Get params
    // 2. Filter by params
    // 3. Change response to return this instead of static

    // Get the search parameter from the request
    const searchParam = request.query.search;

    // Filter the MOCK_ADDRESS_ARRAY based on the search parameter
    const filteredAddresses = MOCK_ADDRESS_ARRAY.filter(address => {
        // Match the search parameter against the address name, postalCode, or city
        const { name, postalCode, city } = address;
        const searchRegex = new RegExp(searchParam, 'i');
        return searchRegex.test(name) || searchRegex.test(postalCode) || searchRegex.test(city);
    });

    res.send(JSON.stringify(filteredAddresses));
};
