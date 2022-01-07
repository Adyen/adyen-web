import { h } from 'preact';
import Installments from './Installments';

export const getInstallmentsComp = ({ amount, brand, installmentOptions, handleInstallments, showAmountsInInstallments }) => (
    <Installments
        amount={amount}
        brand={brand}
        installmentOptions={installmentOptions}
        onChange={handleInstallments}
        type={showAmountsInInstallments ? 'amount' : 'months'}
    />
);
