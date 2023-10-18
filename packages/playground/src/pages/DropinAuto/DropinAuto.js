import '../../style.scss';
import { initSession } from './session';
import { initManual } from './manual';
import { useSession } from '../../config/commonConfig';

const initialize = useSession ? initSession : initManual;

initialize().then(([checkout, dropin]) => {
    window.checkout = checkout;
    window.dropin = dropin;
});
