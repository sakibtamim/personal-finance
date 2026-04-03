import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/client";
import {
  DEFAULT_MONTHLY_FLOW,
  type ExpenseItem,
  type MonthId,
  type MonthlyFlow,
  type WithdrawItem,
} from "@/types/finance";

export type MonthlyFlowEntry = {
  monthId: MonthId;
  monthly: MonthlyFlow;
};

type MonthlyFlowDoc = {
  income?: number;
  expense?: number;
  manualSaved?: number;
  manualWithdrawn?: number;
  expenseItems?: Array<{
    id?: string;
    description?: string;
    amount?: number;
  }>;
  withdrawItems?: Array<{
    id?: string;
    description?: string;
    amount?: number;
  }>;
};

function normalizeExpenseItems(
  items: MonthlyFlowDoc["expenseItems"],
): ExpenseItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      id: typeof item?.id === "string" ? item.id : "",
      description:
        typeof item?.description === "string" ? item.description.trim() : "",
      amount: normalizeAmount(item?.amount),
    }))
    .filter(
      (item) =>
        item.id.length > 0 && item.description.length > 0 && item.amount > 0,
    );
}

function normalizeWithdrawItems(
  items: MonthlyFlowDoc["withdrawItems"],
): WithdrawItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      id: typeof item?.id === "string" ? item.id : "",
      description:
        typeof item?.description === "string" ? item.description.trim() : "",
      amount: normalizeAmount(item?.amount),
    }))
    .filter(
      (item) =>
        item.id.length > 0 && item.description.length > 0 && item.amount > 0,
    );
}

function createExpenseItemId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `expense-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createWithdrawItemId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `withdraw-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeAmount(value: number | undefined): number {
  if (
    typeof value !== "number" ||
    Number.isNaN(value) ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return value;
}

function normalizeMonthlyFlow(data?: MonthlyFlowDoc): MonthlyFlow {
  return {
    income: normalizeAmount(data?.income),
    expense: normalizeAmount(data?.expense),
    manualSaved: normalizeAmount(data?.manualSaved),
    manualWithdrawn: normalizeAmount(data?.manualWithdrawn),
    expenseItems: normalizeExpenseItems(data?.expenseItems),
    withdrawItems: normalizeWithdrawItems(data?.withdrawItems),
  };
}

function monthlyCollection(uid: string) {
  const db = getFirebaseDb();
  return collection(db, "users", uid, "monthlyFlows");
}

function monthlyDocRef(uid: string, monthId: MonthId) {
  const db = getFirebaseDb();
  return doc(db, "users", uid, "monthlyFlows", monthId);
}

export function getCurrentMonthId(date = new Date()): MonthId {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}` as MonthId;
}

export function calculateRemaining(monthly: MonthlyFlow): number {
  return monthly.income - monthly.expense;
}

export function calculateNetContribution(monthly: MonthlyFlow): number {
  return (
    calculateRemaining(monthly) + monthly.manualSaved - monthly.manualWithdrawn
  );
}

export function calculateSpendingBreakdown(
  monthly: MonthlyFlow,
  amount: number,
): { fromCurrentMonth: number; fromSavings: number } {
  const safeAmount = Number.isFinite(amount) ? Math.max(amount, 0) : 0;
  const currentRemaining = Math.max(calculateRemaining(monthly), 0);
  const fromCurrentMonth = Math.min(currentRemaining, safeAmount);

  return {
    fromCurrentMonth,
    fromSavings: safeAmount - fromCurrentMonth,
  };
}

export async function getTotalSavings(uid: string): Promise<number> {
  const snapshot = await getDocs(monthlyCollection(uid));
  let total = 0;

  snapshot.docs.forEach((document) => {
    const monthly = normalizeMonthlyFlow(document.data() as MonthlyFlowDoc);
    total += calculateNetContribution(monthly);
  });

  return total;
}

export function subscribeToMonthlyFlow(
  uid: string,
  monthId: MonthId,
  callback: (monthly: MonthlyFlow) => void,
): () => void {
  return onSnapshot(monthlyDocRef(uid, monthId), (snapshot) => {
    if (!snapshot.exists()) {
      callback(DEFAULT_MONTHLY_FLOW);
      return;
    }

    callback(normalizeMonthlyFlow(snapshot.data() as MonthlyFlowDoc));
  });
}

export function subscribeToTotalSavings(
  uid: string,
  callback: (totalSavings: number) => void,
): () => void {
  return onSnapshot(monthlyCollection(uid), (snapshot) => {
    let total = 0;

    snapshot.docs.forEach((document) => {
      const monthly = normalizeMonthlyFlow(document.data() as MonthlyFlowDoc);
      total += calculateNetContribution(monthly);
    });

    callback(total);
  });
}

export function subscribeToMonthlyFlows(
  uid: string,
  callback: (entries: MonthlyFlowEntry[]) => void,
): () => void {
  return onSnapshot(monthlyCollection(uid), (snapshot) => {
    const entries = snapshot.docs
      .map((document) => ({
        monthId: document.id as MonthId,
        monthly: normalizeMonthlyFlow(document.data() as MonthlyFlowDoc),
      }))
      .sort((a, b) => a.monthId.localeCompare(b.monthId));

    callback(entries);
  });
}

export async function upsertMonthlyFlow(
  uid: string,
  monthId: MonthId,
  values: MonthlyFlow,
): Promise<void> {
  const safeExpenseItems = Array.isArray(values.expenseItems)
    ? values.expenseItems
        .map((item) => ({
          id: item.id,
          description: item.description.trim(),
          amount: normalizeAmount(item.amount),
        }))
        .filter(
          (item) =>
            item.id.length > 0 &&
            item.description.length > 0 &&
            item.amount > 0,
        )
    : [];

  const safeWithdrawItems = Array.isArray(values.withdrawItems)
    ? values.withdrawItems
        .map((item) => ({
          id: item.id,
          description: item.description.trim(),
          amount: normalizeAmount(item.amount),
        }))
        .filter(
          (item) =>
            item.id.length > 0 &&
            item.description.length > 0 &&
            item.amount > 0,
        )
    : [];

  await setDoc(
    monthlyDocRef(uid, monthId),
    {
      income: values.income,
      expense: values.expense,
      manualSaved: values.manualSaved,
      manualWithdrawn: values.manualWithdrawn,
      expenseItems: safeExpenseItems,
      withdrawItems: safeWithdrawItems,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function applyExpenseWithSpendingRule(
  uid: string,
  monthId: MonthId,
  currentMonthly: MonthlyFlow,
  amount: number,
  description = "Expense",
): Promise<{ fromCurrentMonth: number; fromSavings: number }> {
  const safeAmount = Number.isFinite(amount) ? Math.max(amount, 0) : 0;
  const safeDescription = description.trim();

  if (safeAmount <= 0) {
    throw new Error("Expense amount must be greater than zero.");
  }

  if (!safeDescription) {
    throw new Error("Expense reason is required.");
  }

  const totalSavings = await getTotalSavings(uid);

  if (safeAmount > totalSavings) {
    throw new Error("Not enough funds across current month and savings.");
  }

  const breakdown = calculateSpendingBreakdown(currentMonthly, safeAmount);

  await upsertMonthlyFlow(uid, monthId, {
    ...currentMonthly,
    expense: currentMonthly.expense + safeAmount,
    expenseItems: [
      ...(currentMonthly.expenseItems ?? []),
      {
        id: createExpenseItemId(),
        description: safeDescription,
        amount: safeAmount,
      },
    ],
  });

  return breakdown;
}

export async function applyWithdrawWithSavingsRule(
  uid: string,
  monthId: MonthId,
  currentMonthly: MonthlyFlow,
  amount: number,
  description = "Withdraw",
): Promise<void> {
  const safeAmount = Number.isFinite(amount) ? Math.max(amount, 0) : 0;
  const safeDescription = description.trim();

  if (safeAmount <= 0) {
    throw new Error("Withdraw amount must be greater than zero.");
  }

  if (!safeDescription) {
    throw new Error("Withdraw reason is required.");
  }

  await upsertMonthlyFlow(uid, monthId, {
    ...currentMonthly,
    manualWithdrawn: currentMonthly.manualWithdrawn + safeAmount,
    withdrawItems: [
      ...(currentMonthly.withdrawItems ?? []),
      {
        id: createWithdrawItemId(),
        description: safeDescription,
        amount: safeAmount,
      },
    ],
  });
}
