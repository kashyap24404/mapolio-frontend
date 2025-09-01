import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transaction History - Mapolio",
  description: "View your credit purchase and usage history",
};

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}