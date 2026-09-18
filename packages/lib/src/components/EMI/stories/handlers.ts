import { http, HttpResponse } from 'msw';
import { emiPlansResponseMock } from './mocks';

const EMI_PLANS_ENDPOINT = '/api/paymentMethods/emi/plans';

/** Stands in for the merchant backend while developing in Storybook. */
export const emiPlansHandlers = [http.post(EMI_PLANS_ENDPOINT, () => HttpResponse.json(emiPlansResponseMock))];
