import { h } from 'preact';
import UIElement from '../UIElement';
import PrepareChallenge from './components/Challenge';
import { ErrorCodeObject } from './components/utils';
import { DEFAULT_CHALLENGE_WINDOW_SIZE } from './config';
import { existy } from '../internal/SecuredFields/lib/utilities/commonUtils';
import { hasOwnProperty } from '../../utils/hasOwnProperty';
import Language from '../../language';
import { ActionHandledReturnObject } from '../types';
import { ICore } from '../../core/core';

export interface ThreeDS2ChallengeProps {
    core: ICore;
    token?: string;
    dataKey?: string;
    notificationURL?: string;
    onError?: (error: string | ErrorCodeObject) => void;
    paymentData?: string;
    size?: string;
    challengeWindowSize?: '01' | '02' | '03' | '04' | '05';
    type?: string;
    loadingContext?: string;
    useOriginalFlow?: boolean;
    i18n?: Language;
    onActionHandled: (rtnObj: ActionHandledReturnObject) => void;
}

class ThreeDS2Challenge extends UIElement<ThreeDS2ChallengeProps> {
    public static type = 'threeDS2Challenge';

    public static defaultProps = {
        dataKey: 'threeDSResult',
        size: DEFAULT_CHALLENGE_WINDOW_SIZE,
        type: 'ChallengeShopper'
    };

    onComplete(state) {
        if (state) super.onComplete(state);
        this.unmount(); // re. fixing issue around back to back challenge calls
    }

    render() {
        // existy used because threeds2InMDFlow will send empty string for paymentData and we should be allowed to proceed with this
        if (!existy(this.props.paymentData)) {
            /**
             *  One component is used for both old and new 3DS2 challenge flows
             *   - The presence of useOriginalFlow indicates the old flow which used paymentData from the 3DS2 action
             *   - The new flow uses authorisationToken from the 3DS2 action, passed internally in a prop called paymentData
             */
            const dataTypeForError = hasOwnProperty(this.props, 'useOriginalFlow') ? 'paymentData' : 'authorisationToken';

            this.props.onError({ errorCode: 'threeds2.challenge', message: `No ${dataTypeForError} received. Challenge cannot proceed` });
            return null;
        }

        return <PrepareChallenge {...this.props} onComplete={this.onComplete} />;
    }
}

export default ThreeDS2Challenge;
