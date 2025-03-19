import { TAX_TYPES } from "./constants/consts";

export const calculateTotal = (amount: string, taxType: string) => {
    const numAmount = parseFloat(amount) || 0;
    const tax = TAX_TYPES.find((t) => t.id === taxType)?.rate || 0;
    return (numAmount + numAmount * tax).toFixed(2);
};
