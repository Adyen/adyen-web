import VpaInput from '../VpaInput';
import ContentSeparator from '../../../internal/ContentSeparator';
import Button from '../../../internal/Button';
import { h, Fragment, RefObject } from 'preact';
import useCoreContext from '../../../../core/Context/useCoreContext';

interface UPIComponentProps {
    showPayButton?: boolean;
    payButton: (props: any) => h.JSX.Element;
    ref: (ref: RefObject<typeof UPIComponent>) => void;
    onChange: ({ virtualPaymentAddress: string }) => void;
    onSubmit: () => void;
}

export default function UPIComponent(props: UPIComponentProps): h.JSX.Element {
    const { i18n } = useCoreContext();

    return (
        <Fragment>
            <VpaInput />
            {props.showPayButton && props.payButton({ label: `${i18n.get('continue')}` })}
            <ContentSeparator label="or" />
            <Button variant="secondary" label="Generate QR code" />
        </Fragment>
    );
}
