import commonConfiguration from './commonConfig';

const paymentMethodsConfig = {
    ...commonConfiguration,
    shopperName: {
        firstName: 'Jan',
        lastName: 'Jansen',
        gender: 'MALE'
    },
    telephoneNumber: '0612345678',
    shopperEmail: 'test@adyen.com',
    dateOfBirth: '1970-07-10'
    //    billingAddress: {
    //        city: 'Gravenhage',
    //        country: commonConfiguration.countryCode,
    //        houseNumberOrName: '1',
    //        postalCode: '2521VA',
    //        street: 'Neherkade'
    //    },
    //    deliveryAddress: {
    //        city: 'Gravenhage',
    //        country: commonConfiguration.countryCode,
    //        houseNumberOrName: '2',
    //        postalCode: '2521VA',
    //        street: 'Neherkade'
    //    }
};

export default paymentMethodsConfig;
