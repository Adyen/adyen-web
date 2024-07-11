import * as express from 'express';
import { environment } from '../environments/environment';

export const router = express.Router();

router.post('/sessions', async (req, res) => {
    const body = {
        ...req.body,
        merchantAccount: environment.merchantAccount
    };

    const response = await fetch(`https://checkout-test.adyen.com/${environment.apiVersion}/sessions`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'X-Api-Key': environment.apiKey
        }
    });

    const data = await response.json();

    res.status(200).json(data);
});

router.post('/paymentMethods', async (req, res) => {
    const body = {
        ...req.body,
        merchantAccount: environment.merchantAccount
    };

    const response = await fetch(`https://checkout-test.adyen.com/${environment.apiVersion}/paymentMethods`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'X-Api-Key': environment.apiKey
        }
    });

    const data = await response.json();

    res.status(200).json(data);
});
