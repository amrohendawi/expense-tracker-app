"use client"

import { getExpensesAction } from "@/app/actions/expense-actions";
import { ExpensesList } from "./expenses-list";

export async function ExpensesListWrapper({
  startDate,
  endDate
}: {
  startDate: Date;
  endDate: Date;
}) {
  // Fetch expenses for the selected date range
  const expenses = await getExpensesAction({ 
    startDate, 
    endDate 
  });

  return <ExpensesList expenses={expenses} />;
}
