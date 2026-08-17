import { http, HttpResponse } from 'msw';
import { emiPlansResponseMock } from './mocks';

const EMI_PLANS_ENDPOINT = '/api/paymentMethods/emi/plans';

/**
 * Stands in for the merchant backend while developing in Storybook. The empty and failing responses
 * are not handlers: Playwright mocks the same endpoint per test, since the E2E build disables MSW.
 */
export const emiPlansHandlers = [http.post(EMI_PLANS_ENDPOINT, () => HttpResponse.json(emiPlansResponseMock))];
