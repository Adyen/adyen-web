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
};

export default paymentMethodsConfig;
