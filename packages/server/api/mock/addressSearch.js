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
        },
        {
            id: 11,
            name: '17 Abbey Road, EH8 8HL, Edinburgh',
            address: 'Abbey Road',
            postalCode: 'EH8 8HL',
            city: 'Edinburgh',
            houseNumber: 17
        },
        {
            id: 12,
            name: '92 High Street, BT1 1AA, Belfast',
            address: 'High Street',
            postalCode: 'BT1 1AA',
            city: 'Belfast',
            houseNumber: 92
        },
        {
            id: 13,
            name: '63 Princes Street, EH2 2DF, Edinburgh',
            address: 'Princes Street',
            postalCode: 'EH2 2DF',
            city: 'Edinburgh',
            houseNumber: 63
        },
        {
            id: 14,
            name: '28 Baker Street, W1U 3BW, London',
            address: 'Baker Street',
            postalCode: 'W1U 3BW',
            city: 'London',
            houseNumber: 28
        },
        {
            id: 15,
            name: '41 Market Street, EH1 1DF, Edinburgh',
            address: 'Market Street',
            postalCode: 'EH1 1DF',
            city: 'Edinburgh',
            houseNumber: 41
        },
        {
            id: 16,
            name: '9 Queen Street, G1 3DU, Glasgow',
            address: 'Queen Street',
            postalCode: 'G1 3DU',
            city: 'Glasgow',
            houseNumber: 9
        },
        {
            id: 17,
            name: '73 Victoria Street, SW1H 0FA, London',
            address: 'Victoria Street',
            postalCode: 'SW1H 0FA',
            city: 'London',
            houseNumber: 73
        },
        {
            id: 18,
            name: '50 North Bridge, EH1 1QN, Edinburgh',
            address: 'North Bridge',
            postalCode: 'EH1 1QN',
            city: 'Edinburgh',
            houseNumber: 50
        },
        {
            id: 19,
            name: '34 Union Street, AB10 1BD, Aberdeen',
            address: 'Union Street',
            postalCode: 'AB10 1BD',
            city: 'Aberdeen',
            houseNumber: 34
        },
        {
            id: 20,
            name: '16 George Street, EH2 2PF, Edinburgh',
            address: 'George Street',
            postalCode: 'EH2 2PF',
            city: 'Edinburgh',
            houseNumber: 16
        },
        {
            id: 21,
            name: '79 High Street, BT1 2AB, Belfast',
            address: 'High Street',
            postalCode: 'BT1 2AB',
            city: 'Belfast',
            houseNumber: 79
        },
        {
            id: 22,
            name: "22 Queen's Road, AB15 4ZT, Aberdeen",
            address: "Queen's Road",
            postalCode: 'AB15 4ZT',
            city: 'Aberdeen',
            houseNumber: 22
        },
        {
            id: 23,
            name: '10 Regent Street, SW1Y 4PE, London',
            address: 'Regent Street',
            postalCode: 'SW1Y 4PE',
            city: 'London',
            houseNumber: 10
        },
        {
            id: 24,
            name: '57 Buchanan Street, G1 3HL, Glasgow',
            address: 'Buchanan Street',
            postalCode: 'G1 3HL',
            city: 'Glasgow',
            houseNumber: 57
        },
        {
            id: 25,
            name: '37 Hanover Street, EH2 2PJ, Edinburgh',
            address: 'Hanover Street',
            postalCode: 'EH2 2PJ',
            city: 'Edinburgh',
            houseNumber: 37
        },
        {
            id: 26,
            name: '84 Bridge Street, AB11 6JN, Aberdeen',
            address: 'Bridge Street',
            postalCode: 'AB11 6JN',
            city: 'Aberdeen',
            houseNumber: 84
        },
        {
            id: 27,
            name: '8 Princes Square, W2 4NP, London',
            address: 'Princes Square',
            postalCode: 'W2 4NP',
            city: 'London',
            houseNumber: 8
        },
        {
            id: 28,
            name: '49 High Street, EH1 1SR, Edinburgh',
            address: 'High Street',
            postalCode: 'EH1 1SR',
            city: 'Edinburgh',
            houseNumber: 49
        },
        {
            id: 29,
            name: '63 Union Street, AB11 6BH, Aberdeen',
            address: 'Union Street',
            postalCode: 'AB11 6BH',
            city: 'Aberdeen',
            houseNumber: 63
        },
        {
            id: 30,
            name: '17 Buchanan Street, G1 3HL, Glasgow',
            address: 'Buchanan Street',
            postalCode: 'G1 3HL',
            city: 'Glasgow',
            houseNumber: 17
        },
        {
            id: 31,
            name: '29 Royal Mile, EH1 1RD, Edinburgh',
            address: 'Royal Mile',
            postalCode: 'EH1 1RD',
            city: 'Edinburgh',
            houseNumber: 29
        },
        {
            id: 32,
            name: '19 Union Terrace, AB10 1XE, Aberdeen',
            address: 'Union Terrace',
            postalCode: 'AB10 1XE',
            city: 'Aberdeen',
            houseNumber: 19
        },
        {
            id: 33,
            name: '91 Great Portland Street, W1W 7LT, London',
            address: 'Great Portland Street',
            postalCode: 'W1W 7LT',
            city: 'London',
            houseNumber: 91
        },
        {
            id: 34,
            name: '12 Grassmarket, EH1 2JR, Edinburgh',
            address: 'Grassmarket',
            postalCode: 'EH1 2JR',
            city: 'Edinburgh',
            houseNumber: 12
        },
        {
            id: 35,
            name: '76 Northcote Road, SW11 6QL, London',
            address: 'Northcote Road',
            postalCode: 'SW11 6QL',
            city: 'London',
            houseNumber: 76
        },
        {
            id: 36,
            name: '53 Sauchiehall Street, G2 3AT, Glasgow',
            address: 'Sauchiehall Street',
            postalCode: 'G2 3AT',
            city: 'Glasgow',
            houseNumber: 53
        },
        {
            id: 37,
            name: '41 Cockburn Street, EH1 1BS, Edinburgh',
            address: 'Cockburn Street',
            postalCode: 'EH1 1BS',
            city: 'Edinburgh',
            houseNumber: 41
        },
        {
            id: 38,
            name: '67 Rose Street, AB10 1TX, Aberdeen',
            address: 'Rose Street',
            postalCode: 'AB10 1TX',
            city: 'Aberdeen',
            houseNumber: 67
        },
        {
            id: 39,
            name: '38 Charlotte Square, EH2 4HQ, Edinburgh',
            address: 'Charlotte Square',
            postalCode: 'EH2 4HQ',
            city: 'Edinburgh',
            houseNumber: 38
        },
        {
            id: 40,
            name: '18 St. Vincent Street, G2 5TQ, Glasgow',
            address: 'St. Vincent Street',
            postalCode: 'G2 5TQ',
            city: 'Glasgow',
            houseNumber: 18
        },
        {
            id: 41,
            name: '9-13 Market Street, AB11 5PY, Aberdeen',
            address: 'Market Street',
            postalCode: 'AB11 5PY',
            city: 'Aberdeen',
            houseNumber: 9
        },
        {
            id: 42,
            name: '37 Bread Street, EH3 9AH, Edinburgh',
            address: 'Bread Street',
            postalCode: 'EH3 9AH',
            city: 'Edinburgh',
            houseNumber: 37
        },
        {
            id: 43,
            name: '84 Byres Road, G12 8TD, Glasgow',
            address: 'Byres Road',
            postalCode: 'G12 8TD',
            city: 'Glasgow',
            houseNumber: 84
        },
        {
            id: 44,
            name: '57 West Regent Street, G2 2AE, Glasgow',
            address: 'West Regent Street',
            postalCode: 'G2 2AE',
            city: 'Glasgow',
            houseNumber: 57
        },
        {
            id: 45,
            name: '49 George Street, EH2 2HT, Edinburgh',
            address: 'George Street',
            postalCode: 'EH2 2HT',
            city: 'Edinburgh',
            houseNumber: 49
        },
        {
            id: 46,
            name: '39 Union Street, AB11 6BH, Aberdeen',
            address: 'Union Street',
            postalCode: 'AB11 6BH',
            city: 'Aberdeen',
            houseNumber: 39
        },
        {
            id: 47,
            name: '66 Ingram Street, G1 1EX, Glasgow',
            address: 'Ingram Street',
            postalCode: 'G1 1EX',
            city: 'Glasgow',
            houseNumber: 66
        },
        {
            id: 48,
            name: '11 Castle Street, AB11 5BQ, Aberdeen',
            address: 'Castle Street',
            postalCode: 'AB11 5BQ',
            city: 'Aberdeen',
            houseNumber: 11
        },
        {
            id: 49,
            name: '29 George Square, EH8 9LD, Edinburgh',
            address: 'George Square',
            postalCode: 'EH8 9LD',
            city: 'Edinburgh',
            houseNumber: 29
        },
        {
            id: 50,
            name: '63 Gordon Street, G1 3SL, Glasgow',
            address: 'Gordon Street',
            postalCode: 'G1 3SL',
            city: 'Glasgow',
            houseNumber: 63
        },
        {
            id: 51,
            name: '82 Princes Street, EH2 2ER, Edinburgh',
            address: 'Princes Street',
            postalCode: 'EH2 2ER',
            city: 'Edinburgh',
            houseNumber: 82
        },
        {
            id: 52,
            name: '15 Mitchell Lane, G1 3NU, Glasgow',
            address: 'Mitchell Lane',
            postalCode: 'G1 3NU',
            city: 'Glasgow',
            houseNumber: 15
        },
        {
            id: 53,
            name: '58 South Bridge, EH1 1LL, Edinburgh',
            address: 'South Bridge',
            postalCode: 'EH1 1LL',
            city: 'Edinburgh',
            houseNumber: 58
        },
        {
            id: 54,
            name: '24 Candleriggs, G1 1LD, Glasgow',
            address: 'Candleriggs',
            postalCode: 'G1 1LD',
            city: 'Glasgow',
            houseNumber: 24
        },
        {
            id: 55,
            name: '43 Queen Street, EH2 3NH, Edinburgh',
            address: 'Queen Street',
            postalCode: 'EH2 3NH',
            city: 'Edinburgh',
            houseNumber: 43
        },
        {
            id: 56,
            name: '30 St. Andrew Square, EH2 2AD, Edinburgh',
            address: 'St. Andrew Square',
            postalCode: 'EH2 2AD',
            city: 'Edinburgh',
            houseNumber: 30
        },
        {
            id: 57,
            name: '14-18 Queen Street, AB10 1XL, Aberdeen',
            address: 'Queen Street',
            postalCode: 'AB10 1XL',
            city: 'Aberdeen',
            houseNumber: 14
        },
        {
            id: 58,
            name: '68 Buchanan Street, G1 3JE, Glasgow',
            address: 'Buchanan Street',
            postalCode: 'G1 3JE',
            city: 'Glasgow',
            houseNumber: 68
        },
        {
            id: 59,
            name: '36 Chambers Street, EH1 1JW, Edinburgh',
            address: 'Chambers Street',
            postalCode: 'EH1 1JW',
            city: 'Edinburgh',
            houseNumber: 36
        },
        {
            id: 60,
            name: '76 Sauchiehall Street, G2 3DH, Glasgow',
            address: 'Sauchiehall Street',
            postalCode: 'G2 3DH',
            city: 'Glasgow',
            houseNumber: 76
        },
        {
            id: 61,
            name: '27 Frederick Street, EH2 2ND, Edinburgh',
            address: 'Frederick Street',
            postalCode: 'EH2 2ND',
            city: 'Edinburgh',
            houseNumber: 27
        },
        {
            id: 62,
            name: '42-48 Union Street, AB10 1BD, Aberdeen',
            address: 'Union Street',
            postalCode: 'AB10 1BD',
            city: 'Aberdeen',
            houseNumber: 42
        },
        {
            id: 63,
            name: '55 West George Street, G2 2JA, Glasgow',
            address: 'West George Street',
            postalCode: 'G2 2JA',
            city: 'Glasgow',
            houseNumber: 55
        },
        {
            id: 64,
            name: '18-22 George Street, EH2 2PF, Edinburgh',
            address: 'George Street',
            postalCode: 'EH2 2PF',
            city: 'Edinburgh',
            houseNumber: 18
        },
        {
            id: 65,
            name: '29 Royal Exchange Square, G1 3AJ, Glasgow',
            address: 'Royal Exchange Square',
            postalCode: 'G1 3AJ',
            city: 'Glasgow',
            houseNumber: 29
        },
        {
            id: 66,
            name: '67 Lothian Road, EH3 9AZ, Edinburgh',
            address: 'Lothian Road',
            postalCode: 'EH3 9AZ',
            city: 'Edinburgh',
            houseNumber: 67
        },
        {
            id: 67,
            name: '93 Buchanan Street, G1 3HF, Glasgow',
            address: 'Buchanan Street',
            postalCode: 'G1 3HF',
            city: 'Glasgow',
            houseNumber: 93
        },
        {
            id: 68,
            name: '47 Princes Street, EH2 2BY, Edinburgh',
            address: 'Princes Street',
            postalCode: 'EH2 2BY',
            city: 'Edinburgh',
            houseNumber: 47
        },
        {
            id: 69,
            name: '31 Bath Street, G2 1HW, Glasgow',
            address: 'Bath Street',
            postalCode: 'G2 1HW',
            city: 'Glasgow',
            houseNumber: 31
        },
        {
            id: 70,
            name: '22 Hanover Street, EH2 2EP, Edinburgh',
            address: 'Hanover Street',
            postalCode: 'EH2 2EP',
            city: 'Edinburgh',
            houseNumber: 22
        },
        {
            id: 71,
            name: '12-16 Queen Street, AB10 1XL, Aberdeen',
            address: 'Queen Street',
            postalCode: 'AB10 1XL',
            city: 'Aberdeen',
            houseNumber: 12
        },
        {
            id: 72,
            name: '38 Bath Street, G2 1HG, Glasgow',
            address: 'Bath Street',
            postalCode: 'G2 1HG',
            city: 'Glasgow',
            houseNumber: 38
        },
        {
            id: 73,
            name: '59 George Street, EH2 2JG, Edinburgh',
            address: 'George Street',
            postalCode: 'EH2 2JG',
            city: 'Edinburgh',
            houseNumber: 59
        },
        {
            id: 74,
            name: '10-16 Union Street, AB10 1BQ, Aberdeen',
            address: 'Union Street',
            postalCode: 'AB10 1BQ',
            city: 'Aberdeen',
            houseNumber: 10
        },
        {
            id: 75,
            name: '37 Hope Street, G2 6AE, Glasgow',
            address: 'Hope Street',
            postalCode: 'G2 6AE',
            city: 'Glasgow',
            houseNumber: 37
        },
        {
            id: 76,
            name: '28 Frederick Street, EH2 2JR, Edinburgh',
            address: 'Frederick Street',
            postalCode: 'EH2 2JR',
            city: 'Edinburgh',
            houseNumber: 28
        },
        {
            id: 77,
            name: '64 Gordon Street, G1 3RS, Glasgow',
            address: 'Gordon Street',
            postalCode: 'G1 3RS',
            city: 'Glasgow',
            houseNumber: 64
        },
        {
            id: 78,
            name: '22 St. Andrew Square, EH2 1AF, Edinburgh',
            address: 'St. Andrew Square',
            postalCode: 'EH2 1AF',
            city: 'Edinburgh',
            houseNumber: 22
        },
        {
            id: 79,
            name: '25 George Square, G2 1EQ, Glasgow',
            address: 'George Square',
            postalCode: 'G2 1EQ',
            city: 'Glasgow',
            houseNumber: 25
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
    }).slice(0, 9);

    res.send(JSON.stringify(filteredAddresses));
};
