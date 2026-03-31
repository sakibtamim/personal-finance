import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/client";
import {
  DEFAULT_MONTHLY_FLOW,
  type MonthId,
  type MonthlyFlow,
} from "@/types/finance";

type MonthlyFlowDoc = {
  income?: number;
  expense?: number;
  manualSaved?: number;
  manualWithdrawn?: number;
};

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

export async function upsertMonthlyFlow(
  uid: string,
  monthId: MonthId,
  values: MonthlyFlow,
): Promise<void> {
  await setDoc(
    monthlyDocRef(uid, monthId),
    {
      income: values.income,
      expense: values.expense,
      manualSaved: values.manualSaved,
      manualWithdrawn: values.manualWithdrawn,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
