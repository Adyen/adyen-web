import { CheckoutSession } from '../../types';

class Session {
    private session: CheckoutSession;
    constructor(session) {
        this.session = session;
    }

    updateSessionData(latestData: string) {
        this.session.data = latestData;
    }
}
export default Session;
