import { h } from 'preact';
import { useState } from 'preact/hooks';

import { EMIHybridFundingSource } from './types';
import { SegmentedControl } from '../internal/SegmentedControl';

import type { PayButtonFunctionProps } from '../internal/UIElement/types';
import { useCoreContext } from '../../core/Context/CoreProvider';
import useImage from '../../core/Context/useImage';
import { PREFIX } from '../internal/Icon/constants';

interface EMIHybridComponentProps {
    defaultActiveFundingSource: EMIHybridFundingSource;
    onSetActiveFundingSource: (fundingSource: EMIHybridFundingSource) => void;
    showPayButton: boolean;
    payButton: (props: PayButtonFunctionProps) => h.JSX.Element;
    cardSlotRef: (ref: HTMLElement | null) => void;
    upiSlotRef: (ref: HTMLElement | null) => void;
}

export const EMIHybridComponent = ({
    defaultActiveFundingSource,
    onSetActiveFundingSource,
    showPayButton,
    payButton,
    cardSlotRef,
    upiSlotRef
}: Readonly<EMIHybridComponentProps>) => {
    const { i18n } = useCoreContext();
    const getImage = useImage();

    const [activeFundingSource, setActiveFundingSource] = useState<EMIHybridFundingSource>(defaultActiveFundingSource);

    const handleFundingSourceChange = (fundingSource: EMIHybridFundingSource) => {
        setActiveFundingSource(fundingSource);
        onSetActiveFundingSource(fundingSource);
    };

    return (
        <div>
            <SegmentedControl
                onChange={source => handleFundingSourceChange(source)}
                selectedValue={activeFundingSource}
                options={[
                    {
                        label: 'Card',
                        value: EMIHybridFundingSource.CARD,
                        id: `${EMIHybridFundingSource.CARD}-id`,
                        controls: `${EMIHybridFundingSource.CARD}-control`
                    },
                    {
                        label: 'UPI',
                        value: EMIHybridFundingSource.UPI,
                        id: `${EMIHybridFundingSource.UPI}-id`,
                        controls: `${EMIHybridFundingSource.UPI}-control`
                    }
                ]}
            />
            <div
                style={{
                    marginTop: 16
                }}
            >
                <div
                    ref={cardSlotRef}
                    style={{ display: activeFundingSource === EMIHybridFundingSource.CARD ? 'block' : 'none' }}
                    data-slot="card"
                />
                <div
                    ref={upiSlotRef}
                    style={{ display: activeFundingSource === EMIHybridFundingSource.UPI ? 'block' : 'none' }}
                    data-slot="upi"
                />
            </div>
            {showPayButton &&
                payButton({
                    label: activeFundingSource === EMIHybridFundingSource.UPI ? i18n.get('generateQRCode') : undefined,
                    icon:
                        activeFundingSource === EMIHybridFundingSource.UPI
                            ? getImage({ imageFolder: 'components/' })('qr')
                            : getImage({ imageFolder: 'components/' })(`${PREFIX}lock`)
                })}
        </div>
    );
};
