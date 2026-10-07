import { http, HttpResponse } from 'msw';
import { emiPlansResponseMock } from './mocks';

/** The checkoutShopper plans lookup the component calls itself. MSW matches it whatever the query string. */
const EMI_PLANS_ENDPOINT = '*/checkoutshopper/v1/emi/plans';

/** Answers the plans lookup in Storybook, so the stories render plans whatever the test environment returns. */
export const emiPlansHandlers = [http.post(EMI_PLANS_ENDPOINT, () => HttpResponse.json(emiPlansResponseMock))];
