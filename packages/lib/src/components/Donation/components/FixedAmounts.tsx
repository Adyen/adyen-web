import { h, Fragment } from 'preact';
import ButtonGroup from '../../internal/ButtonGroup';
import Button from '../../internal/Button';
import { getAmountLabel } from './utils';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { Status } from './types';

interface FixedAmountsProps {
    selectedAmount: number;
    currency: string;
    values: Array<number>;
    status: Status;
    onAmountSelected: ({ target }) => void;
    onDonateButtonClicked: () => void;
}
export default function FixedAmounts(props: FixedAmountsProps) {
    const { currency, values, selectedAmount, status, onAmountSelected, onDonateButtonClicked } = props;
    const { i18n } = useCoreContext();

    return (
        <Fragment>
            <div className="adyen-checkout__amounts">
                <ButtonGroup
                    options={values.map(value => ({
                        value,
                        label: getAmountLabel(i18n, { value, currency }),
                        disabled: status === 'loading',
                        selected: value === selectedAmount
                    }))}
                    name="amount"
                    onChange={onAmountSelected}
                />
            </div>
            <Button
                classNameModifiers={['donate']}
                onClick={onDonateButtonClicked}
                label={i18n.get('donateButton')}
                disabled={selectedAmount === null}
                status={status}
            />
        </Fragment>
    );
}
