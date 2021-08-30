import { h } from 'preact';
import { DATA_UID } from '../../../../internal/SecuredFields/lib/configuration/constants';

/**
 * Exists to make the uniqueId created by the Field comp accessible to the SFP via a data-uid attr
 */
export default function DataSfSpan(props) {
    const opts = { ...props, [DATA_UID]: props.uniqueId };
    return <span {...opts}>{props.children}</span>;
}
