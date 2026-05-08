export const donationCampaignsFixedAmountsMockData = {
    donationCampaigns: [
        {
            id: 'DOCA42CTP223225xxx',
            donation: {
                currency: 'EUR',
                type: 'fixedAmounts',
                values: [100, 200, 300]
            },
            nonprofitName: 'Giving Nonprofit Demo',
            nonprofitDescription: 'Giving Nonprofit Demo was founded in 2023 to test Giving!!',
            nonprofitUrl: 'https://www.adyen.com',
            logoUrl: 'https://cdf6519016.cdn.adyen.com/adyen-giving/causes/04080756-16bf-43a2-8fa5-721c73c3b395.png',
            bannerUrl: 'https://cdf6519016.cdn.adyen.com/adyen-giving/causes/a06fe763-f9b7-417c-8717-39b121385136.jpg',
            termsAndConditionsUrl: 'https://www.adyen.com'
        }
    ],
    sessionData: 'mock-session-data'
};

export const donationSuccessMockData = {
    resultCode: 'Authorised',
    sessionData: 'mock-session-data'
};
