import { h } from 'preact';
import './DetailsTable.scss';

export interface DetailsTableData
    extends Array<{
        label: string;
        value: string;
    }> {}

export interface DetailsTableProps {
    tableFields: DetailsTableData;
}

export default function DetailsTable({ tableFields }: DetailsTableProps) {
    // For context, this markup uses 2 classes for backwards compatibility
    // This was originally part of the voucher component and ported out
    // We can remove the voucher class names at point
    return (
        <dl className="adyen-checkout__voucher-result__details adyen-checkout__details-table">
            {tableFields
                // first remove empty values
                .filter(item => !!item)
                // or objects without label and value
                .filter(({ label, value }) => !!label && !!value)
                .map(({ label, value }, index) => (
                    <div key={index} className="adyen-checkout__voucher-result__details__item adyen-checkout__details-table__item">
                        <dt className="adyen-checkout__voucher-result__details__label adyen-checkout__details-table__label">{label}</dt>
                        <dd className="adyen-checkout__voucher-result__details__value adyen-checkout__details-table__value">{value}</dd>
                    </div>
                ))}
        </dl>
    );
}
