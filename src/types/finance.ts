export type MonthId = `${number}-${number}`;

export type ExpenseItem = {
  id: string;
  description: string;
  amount: number;
};

export type IncomeItem = {
  id: string;
  description: string;
  amount: number;
};

export type WithdrawItem = {
  id: string;
  description: string;
  amount: number;
};

export type MonthlyFlow = {
  income: number;
  expense: number;
  manualSaved: number;
  manualWithdrawn: number;
  incomeItems?: IncomeItem[];
  expenseItems?: ExpenseItem[];
  withdrawItems?: WithdrawItem[];
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
  incomeItems: [],
  expenseItems: [],
  withdrawItems: [],
};
