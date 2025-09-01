'use client'

import React, { useEffect, useState } from 'react'
import { useSupabase } from '@/lib/supabase-provider'
import { creditService } from '@/lib/supabase-services'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface Transaction {
  id: string
  credits_purchased: number
  amount_paid_cents: number
  payment_gateway: string
  status: string
  created_at: string
}

const PurchaseHistory = () => {
  const { user } = useSupabase()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTransactions() {
      if (!user) return

      try {
        setLoading(true)
        const { transactions: data, error } = await creditService.getPurchaseHistory(user.id)
        
        if (error) {
          throw error
        }
        
        if (data) {
          setTransactions(data)
        }
      } catch (err) {
        console.error('Error loading transactions:', err)
        setError('Failed to load purchase history')
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [user])

  if (!user) {
    return <div>Please sign in to view your purchase history</div>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase History</CardTitle>
        <CardDescription>Your recent credit purchase transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="ml-2">Loading transactions...</span>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No purchase history found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.created_at)}</TableCell>
                  <TableCell>{transaction.credits_purchased.toLocaleString()}</TableCell>
                  <TableCell>{formatCurrency(transaction.amount_paid_cents)}</TableCell>
                  <TableCell className="capitalize">{transaction.payment_gateway}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export default PurchaseHistory