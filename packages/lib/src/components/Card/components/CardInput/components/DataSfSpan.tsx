import { h } from 'preact';
import { DATA_ENCRYPTED_FIELD_ATTR, DATA_INFO, DATA_UID } from '../../../../internal/SecuredFields/lib/constants';
import { SfSpanProps } from './types';

/**
 * Extract the relevant props and write them as attributes to the span that will contain the securedFields iframe
 * Specifically exists to make the uniqueId created by the Field comp accessible to the SFP via a data-uid attr
 */
export default function DataSfSpan(props: SfSpanProps) {
    const opts = {
        [DATA_ENCRYPTED_FIELD_ATTR]: props.encryptedFieldType,
        [DATA_INFO]: props['data-info'],
        [DATA_UID]: props.uniqueId,
        className: props.className
    };
    return <span {...opts}>{props.children}</span>;
}
