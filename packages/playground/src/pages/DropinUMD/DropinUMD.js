import '../../style.scss';
import { initSession } from './session';
import { initManual } from './manual';
import { useSession } from '../../config/commonConfig';

import('../../../../lib/dist/umd/adyen.js').then(teste => {
    console.log('UMD loaded');

    const initialize = useSession ? initSession : initManual;

    initialize().then(([checkout, dropin]) => {
        window.checkout = checkout;
        window.dropin = dropin;
    });
});
