"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  applyIncomeEntry,
  applyExpenseWithSpendingRule,
  applyWithdrawWithSavingsRule,
  calculateNetContribution,
  calculateRemaining,
  getCurrentMonthId,
  subscribeToMonthlyFlow,
  subscribeToMonthlyFlows,
  subscribeToTotalSavings,
  upsertMonthlyFlow,
  type MonthlyFlowEntry,
} from "@/lib/firebase/finance";
import {
  deriveSavingsActivities,
  type SavingsActivity,
} from "@/lib/dashboard/view-utils";
import { useAuthStore } from "@/store/use-auth-store";
import {
  DEFAULT_MONTHLY_FLOW,
  type MonthId,
  type MonthlyFlow,
} from "@/types/finance";

type DashboardFinanceContextValue = {
  currentMonthId: string;
  selectedMonthId: string;
  setSelectedMonthId: (monthId: string) => void;
  currentMonthly: MonthlyFlow;
  selectedMonthly: MonthlyFlow;
  remainingCurrent: number;
  remainingSelected: number;
  totalSavings: number;
  savingsAtSelectedMonth: number;
  activities: SavingsActivity[];
  monthlyEntries: MonthlyFlowEntry[];
  isLoading: boolean;
  saveSelectedMonth: (values: MonthlyFlow) => Promise<void>;
  addIncomeCurrent: (amount: number, description: string) => Promise<void>;
  addExpenseCurrent: (amount: number, description: string) => Promise<void>;
  addSavedCurrent: (amount: number) => Promise<void>;
  addWithdrawCurrent: (amount: number, description: string) => Promise<void>;
  removeIncomeEntryCurrent: (entryId: string) => Promise<void>;
  removeExpenseEntryCurrent: (entryId: string) => Promise<void>;
  removeWithdrawEntryCurrent: (entryId: string) => Promise<void>;
};

const DashboardFinanceContext =
  createContext<DashboardFinanceContextValue | null>(null);

function clampAmount(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

type DashboardFinanceProviderProps = {
  children: ReactNode;
};

export function DashboardFinanceProvider({
  children,
}: DashboardFinanceProviderProps) {
  const user = useAuthStore((state) => state.user);
  const status = useAuthStore((state) => state.status);

  const currentMonthId = useMemo(() => getCurrentMonthId(), []);

  const [selectedMonthId, setSelectedMonthId] =
    useState<string>(currentMonthId);
  const [currentMonthly, setCurrentMonthly] = useState(DEFAULT_MONTHLY_FLOW);
  const [selectedMonthly, setSelectedMonthly] = useState(DEFAULT_MONTHLY_FLOW);
  const [totalSavings, setTotalSavings] = useState(0);
  const [allEntries, setAllEntries] = useState<MonthlyFlowEntry[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    return subscribeToMonthlyFlow(
      user.uid,
      currentMonthId as MonthId,
      (next) => {
        setCurrentMonthly(next);
      },
    );
  }, [currentMonthId, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    return subscribeToMonthlyFlow(
      user.uid,
      selectedMonthId as MonthId,
      (next) => {
        setSelectedMonthly(next);
      },
    );
  }, [selectedMonthId, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    return subscribeToTotalSavings(user.uid, (next) => {
      setTotalSavings(next);
    });
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    return subscribeToMonthlyFlows(user.uid, (entries) => {
      setAllEntries(entries);
    });
  }, [user]);

  const saveSelectedMonth = useCallback(
    async (values: MonthlyFlow) => {
      if (!user) {
        throw new Error("Please sign in to continue.");
      }

      await upsertMonthlyFlow(user.uid, selectedMonthId as MonthId, {
        income: clampAmount(values.income),
        expense: clampAmount(values.expense),
        manualSaved: clampAmount(values.manualSaved),
        manualWithdrawn: clampAmount(values.manualWithdrawn),
        incomeItems: (values.incomeItems ?? [])
          .map((item) => ({
            id: item.id,
            description: item.description.trim(),
            amount: clampAmount(item.amount),
          }))
          .filter(
            (item) =>
              item.id.length > 0 &&
              item.description.length > 0 &&
              item.amount > 0,
          ),
        expenseItems: (values.expenseItems ?? [])
          .map((item) => ({
            id: item.id,
            description: item.description.trim(),
            amount: clampAmount(item.amount),
          }))
          .filter(
            (item) =>
              item.id.length > 0 &&
              item.description.length > 0 &&
              item.amount > 0,
          ),
        withdrawItems: (values.withdrawItems ?? [])
          .map((item) => ({
            id: item.id,
            description: item.description.trim(),
            amount: clampAmount(item.amount),
          }))
          .filter(
            (item) =>
              item.id.length > 0 &&
              item.description.length > 0 &&
              item.amount > 0,
          ),
      });
    },
    [selectedMonthId, user],
  );

  const addIncomeCurrent = useCallback(
    async (amount: number, description: string) => {
      if (!user) {
        throw new Error("Please sign in to continue.");
      }

      const safeAmount = clampAmount(amount);
      if (safeAmount <= 0) {
        throw new Error("Income amount must be greater than zero.");
      }

      await applyIncomeEntry(
        user.uid,
        currentMonthId as MonthId,
        currentMonthly,
        safeAmount,
        description,
      );
    },
    [currentMonthId, currentMonthly, user],
  );

  const addExpenseCurrent = useCallback(
    async (amount: number, description: string) => {
      if (!user) {
        throw new Error("Please sign in to continue.");
      }

      const safeAmount = clampAmount(amount);
      if (safeAmount <= 0) {
        throw new Error("Expense amount must be greater than zero.");
      }

      await applyExpenseWithSpendingRule(
        user.uid,
        currentMonthId as MonthId,
        currentMonthly,
        safeAmount,
        description,
      );
    },
    [currentMonthId, currentMonthly, user],
  );

  const addSavedCurrent = useCallback(
    async (amount: number) => {
      if (!user) {
        throw new Error("Please sign in to continue.");
      }

      const safeAmount = clampAmount(amount);
      if (safeAmount <= 0) {
        throw new Error("Save amount must be greater than zero.");
      }

      await upsertMonthlyFlow(user.uid, currentMonthId as MonthId, {
        ...currentMonthly,
        manualSaved: currentMonthly.manualSaved + safeAmount,
      });
    },
    [currentMonthId, currentMonthly, user],
  );

  const addWithdrawCurrent = useCallback(
    async (amount: number, description: string) => {
      if (!user) {
        throw new Error("Please sign in to continue.");
      }

      const safeAmount = clampAmount(amount);
      if (safeAmount <= 0) {
        throw new Error("Withdraw amount must be greater than zero.");
      }

      await applyWithdrawWithSavingsRule(
        user.uid,
        currentMonthId as MonthId,
        currentMonthly,
        safeAmount,
        description,
      );
    },
    [currentMonthId, currentMonthly, user],
  );

  const removeIncomeEntryCurrent = useCallback(
    async (entryId: string) => {
      if (!user) {
        throw new Error("Please sign in to continue.");
      }

      const target = (currentMonthly.incomeItems ?? []).find(
        (item) => item.id === entryId,
      );

      if (!target) {
        return;
      }

      await upsertMonthlyFlow(user.uid, currentMonthId as MonthId, {
        ...currentMonthly,
        income: Math.max(0, currentMonthly.income - target.amount),
        incomeItems: (currentMonthly.incomeItems ?? []).filter(
          (item) => item.id !== entryId,
        ),
      });
    },
    [currentMonthId, currentMonthly, user],
  );

  const removeExpenseEntryCurrent = useCallback(
    async (entryId: string) => {
      if (!user) {
        throw new Error("Please sign in to continue.");
      }

      const target = (currentMonthly.expenseItems ?? []).find(
        (item) => item.id === entryId,
      );

      if (!target) {
        return;
      }

      await upsertMonthlyFlow(user.uid, currentMonthId as MonthId, {
        ...currentMonthly,
        expense: Math.max(0, currentMonthly.expense - target.amount),
        expenseItems: (currentMonthly.expenseItems ?? []).filter(
          (item) => item.id !== entryId,
        ),
      });
    },
    [currentMonthId, currentMonthly, user],
  );

  const removeWithdrawEntryCurrent = useCallback(
    async (entryId: string) => {
      if (!user) {
        throw new Error("Please sign in to continue.");
      }

      const target = (currentMonthly.withdrawItems ?? []).find(
        (item) => item.id === entryId,
      );

      if (!target) {
        return;
      }

      await upsertMonthlyFlow(user.uid, currentMonthId as MonthId, {
        ...currentMonthly,
        manualWithdrawn: Math.max(
          0,
          currentMonthly.manualWithdrawn - target.amount,
        ),
        withdrawItems: (currentMonthly.withdrawItems ?? []).filter(
          (item) => item.id !== entryId,
        ),
      });
    },
    [currentMonthId, currentMonthly, user],
  );

  const savingsAtSelectedMonth = useMemo(
    () =>
      allEntries
        .filter((entry) => entry.monthId <= selectedMonthId)
        .reduce(
          (total, entry) => total + calculateNetContribution(entry.monthly),
          0,
        ),
    [allEntries, selectedMonthId],
  );

  const activities = useMemo(() => {
    return deriveSavingsActivities(allEntries);
  }, [allEntries]);

  const contextValue = useMemo<DashboardFinanceContextValue>(() => {
    const safeCurrentMonthly = user ? currentMonthly : DEFAULT_MONTHLY_FLOW;
    const safeSelectedMonthly = user ? selectedMonthly : DEFAULT_MONTHLY_FLOW;
    const safeTotalSavings = user ? totalSavings : 0;
    const safeSavingsAtSelectedMonth = user ? savingsAtSelectedMonth : 0;
    const safeActivities = user ? activities : [];
    const safeMonthlyEntries = user ? allEntries : [];

    return {
      currentMonthId,
      selectedMonthId,
      setSelectedMonthId,
      currentMonthly: safeCurrentMonthly,
      selectedMonthly: safeSelectedMonthly,
      remainingCurrent: calculateRemaining(safeCurrentMonthly),
      remainingSelected: calculateRemaining(safeSelectedMonthly),
      totalSavings: safeTotalSavings,
      savingsAtSelectedMonth: safeSavingsAtSelectedMonth,
      activities: safeActivities,
      monthlyEntries: safeMonthlyEntries,
      isLoading: status === "loading",
      saveSelectedMonth,
      addIncomeCurrent,
      addExpenseCurrent,
      addSavedCurrent,
      addWithdrawCurrent,
      removeIncomeEntryCurrent,
      removeExpenseEntryCurrent,
      removeWithdrawEntryCurrent,
    };
  }, [
    activities,
    allEntries,
    addExpenseCurrent,
    addIncomeCurrent,
    addSavedCurrent,
    addWithdrawCurrent,
    removeExpenseEntryCurrent,
    removeIncomeEntryCurrent,
    removeWithdrawEntryCurrent,
    currentMonthId,
    currentMonthly,
    saveSelectedMonth,
    savingsAtSelectedMonth,
    selectedMonthId,
    selectedMonthly,
    status,
    totalSavings,
    user,
  ]);

  return (
    <DashboardFinanceContext.Provider value={contextValue}>
      {children}
    </DashboardFinanceContext.Provider>
  );
}

export function useDashboardFinance() {
  const context = useContext(DashboardFinanceContext);

  if (!context) {
    throw new Error(
      "useDashboardFinance must be used within DashboardFinanceProvider.",
    );
  }

  return context;
}
