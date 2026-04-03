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
  applyExpenseWithSpendingRule,
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
  isLoading: boolean;
  saveSelectedMonth: (values: MonthlyFlow) => Promise<void>;
  addIncomeCurrent: (amount: number) => Promise<void>;
  addExpenseCurrent: (amount: number) => Promise<void>;
  addSavedCurrent: (amount: number) => Promise<void>;
  addWithdrawCurrent: (amount: number) => Promise<void>;
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
      });
    },
    [selectedMonthId, user],
  );

  const addIncomeCurrent = useCallback(
    async (amount: number) => {
      if (!user) {
        throw new Error("Please sign in to continue.");
      }

      const safeAmount = clampAmount(amount);
      if (safeAmount <= 0) {
        throw new Error("Income amount must be greater than zero.");
      }

      await upsertMonthlyFlow(user.uid, currentMonthId as MonthId, {
        ...currentMonthly,
        income: currentMonthly.income + safeAmount,
      });
    },
    [currentMonthId, currentMonthly, user],
  );

  const addExpenseCurrent = useCallback(
    async (amount: number) => {
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
    async (amount: number) => {
      if (!user) {
        throw new Error("Please sign in to continue.");
      }

      const safeAmount = clampAmount(amount);
      if (safeAmount <= 0) {
        throw new Error("Withdraw amount must be greater than zero.");
      }

      await upsertMonthlyFlow(user.uid, currentMonthId as MonthId, {
        ...currentMonthly,
        manualWithdrawn: currentMonthly.manualWithdrawn + safeAmount,
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
      isLoading: status === "loading",
      saveSelectedMonth,
      addIncomeCurrent,
      addExpenseCurrent,
      addSavedCurrent,
      addWithdrawCurrent,
    };
  }, [
    activities,
    addExpenseCurrent,
    addIncomeCurrent,
    addSavedCurrent,
    addWithdrawCurrent,
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
