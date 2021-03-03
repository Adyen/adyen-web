import { httpPost } from './http';

/**
 */
function setupSession(session, { clientKey, loadingContext }): Promise<any> {
    const path = `v1/sessions/${session.id}/setup?clientKey=${clientKey}`;
    const data = {
        sessionData: session.data
    };

    return httpPost({ loadingContext, path }, data);
}

export default setupSession;
