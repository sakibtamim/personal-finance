export type MonthId = `${number}-${number}`;

export type MonthlyFlow = {
  income: number;
  expense: number;
  manualSaved: number;
  manualWithdrawn: number;
};

export type FinanceSnapshot = {
  monthId: MonthId;
  monthly: MonthlyFlow;
  remaining: number;
  totalSavings: number;
};

export const DEFAULT_MONTHLY_FLOW: MonthlyFlow = {
  income: 0,
  expense: 0,
  manualSaved: 0,
  manualWithdrawn: 0,
};
