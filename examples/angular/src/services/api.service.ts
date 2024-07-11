import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DEFAULT_SHOPPER_REFERENCE } from '../utils/constants';
import paymentsConfig from '../utils/paymentsConfig';

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=UTF-8'
    })
};

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    constructor(private http: HttpClient) {}

    createSession(countryCode: string, shopperLocale: string, amount: { value: number; currency: string }): Observable<any> {
        const payload = {
            amount,
            countryCode,
            shopperLocale,
            channel: 'Web',
            shopperReference: DEFAULT_SHOPPER_REFERENCE,
            lineItems: paymentsConfig.lineItems,
            reference: paymentsConfig.reference,
            returnUrl: paymentsConfig.returnUrl,
            shopperEmail: paymentsConfig.shopperEmail
        };

        return this.http.post('/api/sessions', payload, httpOptions);
    }

    fetchPaymentMethods(countryCode: string, shopperLocale: string, amount: { value: number; currency: string }) {}
}
