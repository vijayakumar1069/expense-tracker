"use client"

import * as React from "react"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TransactionType } from "@prisma/client"
import { format } from "date-fns"

interface Transaction {
  id: string
  type: TransactionType
  name: string
  amount: number
  date: Date
  category: string
  user: {
    name: string
    email: string
  }
  paymentMethod?: {
    type: string
    bankName?: string
    chequeNo?: string
  }
}

export function RecentTransactions() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([])

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/transactions/recent')
        const data = await response.json()
        setTransactions(data)
      } catch (error) {
        console.error("Error fetching transactions:", error)
      }
    }
    fetchData()
  }, [])

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-[#f8fafc] to-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Last 10 activities</CardDescription>
          </div>
          <Badge variant="outline" className="bg-white/50 backdrop-blur-sm">
            Real-time Updates
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between px-4 py-2 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {transaction.type === 'INCOME' ? (
                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowDownLeft className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="font-medium">{transaction.name}</div>
                  <div className="text-sm text-gray-500">
                    {transaction.user.name} • {transaction.category}
                  </div>
                  {transaction.paymentMethod && (
                    <div className="text-xs text-gray-400">
                      {transaction.paymentMethod.type === 'BANK' && `Bank: ${transaction.paymentMethod.bankName}`}
                      {transaction.paymentMethod.type === 'CHEQUE' && `Cheque #${transaction.paymentMethod.chequeNo}`}
                      {transaction.paymentMethod.type === 'CASH' && 'Cash Transaction'}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'INCOME' ? '+' : '-'}₹{Math.abs(transaction.amount).toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">
                  {format(new Date(transaction.date), 'MMM dd, hh:mm a')}
                </div>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="p-4 text-center text-gray-400">
              No transactions found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}