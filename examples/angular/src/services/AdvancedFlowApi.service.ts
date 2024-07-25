import { AdditionalDetailsData, ResultCode } from '@adyen/adyen-web';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DEFAULT_SHOPPER_REFERENCE } from '../utils/constants';
import paymentsConfig from '../utils/paymentsConfig';

type PaymentsResponse = {
    resultCode: ResultCode;
    action?: any;
    order?: any;
    donationToken?: string;
};

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=UTF-8'
    })
};

@Injectable({
    providedIn: 'root'
})
export class AdvancedFlowApiService {
    constructor(private http: HttpClient) {}

    fetchPaymentMethods(countryCode: string, shopperLocale: string, amount: { value: number; currency: string }) {
        const payload = {
            countryCode,
            shopperLocale,
            amount,
            channel: 'Web',
            shopperName: {
                firstName: 'Jonny',
                lastName: 'Jansen',
                gender: 'MALE'
            },
            shopperReference: DEFAULT_SHOPPER_REFERENCE,
            telephoneNumber: '0612345678',
            shopperEmail: 'test@adyen.com',
            dateOfBirth: '1970-07-10'
        };

        return this.http.post('/api/paymentMethods', payload, httpOptions);
    }

    makePaymentsCall(data: any, countryCode: string, shopperLocale: string, amount: { currency: string; value: number }) {
        const payload = {
            ...paymentsConfig,
            ...data,
            countryCode,
            shopperLocale,
            amount,
            shopperReference: DEFAULT_SHOPPER_REFERENCE,
            channel: 'Web'
        };

        return this.http.post<PaymentsResponse>('/api/payments', payload, httpOptions);
    }

    makeDetailsCall(data: AdditionalDetailsData['data']) {
        return this.http.post<PaymentsResponse>('/api/paymentDetails', data, httpOptions);
    }
}
