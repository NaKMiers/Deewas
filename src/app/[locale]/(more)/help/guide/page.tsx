'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Edit, Heart, LucideChevronLeft, Mail, PlusCircle, Trash, Wallet } from 'lucide-react' // Icon từ lucide-react
import Link from 'next/link'

function UserGuidePage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <Link
        href="/"
        className="flex items-center"
      >
        <LucideChevronLeft size={20} />
        <span className="font-medium">Home</span>
      </Link>

      {/* Header */}
      <header className="py-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Deewas User Guide
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Learn how to master your finances with Deewas
        </p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Introduction */}
        <section className="mb-12 text-center">
          <h2 className="text-2xl font-semibold text-foreground">Welcome to Deewas</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            This guide will walk you through the core features of Deewas, from managing transactions to
            setting budgets. Let’s get started!
          </p>
          <Button
            asChild
            variant="outline"
            className="mt-4"
          >
            <Link href="#getting-started">Jump to Guide</Link>
          </Button>
        </section>

        {/* Separator */}
        <Separator className="my-12" />

        {/* Guide Content with Tabs */}
        <section id="getting-started">
          <h2 className="mb-6 text-center text-2xl font-semibold text-foreground">Step-by-Step Guide</h2>
          <Tabs
            defaultValue="transactions"
            className="w-full"
          >
            <TabsList className="grid h-auto grid-cols-2 md:grid-cols-4">
              <TabsTrigger
                className="h-8"
                value="transactions"
              >
                Transactions
              </TabsTrigger>
              <TabsTrigger
                className="h-8"
                value="wallets"
              >
                Wallets
              </TabsTrigger>
              <TabsTrigger
                className="h-8"
                value="categories"
              >
                Categories
              </TabsTrigger>
              <TabsTrigger
                className="h-8"
                value="budgets"
              >
                Budgets
              </TabsTrigger>
            </TabsList>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-primary" />
                    Managing Transactions
                  </CardTitle>
                  <CardDescription>Track your income and expenses effortlessly.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] w-full">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-foreground">1. Adding a Transaction</h3>
                        <p className="mt-2 text-muted-foreground">
                          - Navigate to the <strong>Transactions</strong> page from the sidebar.
                          <br />- Click the <strong>“Add Transaction”</strong> button.
                          <br />- Fill in details: name (e.g., “Coffee”), amount (e.g., $5), date,
                          wallet, and category.
                          <br />- Click <strong>“Save”</strong> to record it.
                        </p>
                        <p className="mt-2 text-sm italic text-muted-foreground">
                          Tip: Use the AI chat to say “Add $5 coffee expense today” for a quicker way!
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-foreground">2. Editing a Transaction</h3>
                        <p className="mt-2 text-muted-foreground">
                          - Find the transaction in the list.
                          <br />- Click the <Edit className="inline h-4 w-4" /> icon next to it.
                          <br />- Update the details and save.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-foreground">
                          3. Deleting a Transaction
                        </h3>
                        <p className="mt-2 text-muted-foreground">
                          - Locate the transaction.
                          <br />- Click the <Trash className="inline h-4 w-4" /> icon.
                          <br />- Confirm deletion in the dialog.
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wallets Tab */}
            <TabsContent value="wallets">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    Managing Wallets
                  </CardTitle>
                  <CardDescription>Organize your money across multiple wallets.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] w-full">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-foreground">1. Creating a Wallet</h3>
                        <p className="mt-2 text-muted-foreground">
                          - Go to the <strong>Wallets</strong> page.
                          <br />- Click <strong>“Add Wallet”</strong>.
                          <br />- Enter a name (e.g., “Cash”) and choose an icon.
                          <br />- Save to create it.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-foreground">2. Transferring Funds</h3>
                        <p className="mt-2 text-muted-foreground">
                          - Select a wallet and click <strong>“Transfer”</strong>.
                          <br />- Choose the destination wallet and amount.
                          <br />- Confirm the transfer.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-foreground">
                          3. Viewing Wallet Details
                        </h3>
                        <p className="mt-2 text-muted-foreground">
                          - Click a wallet to see its transactions and balance.
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-primary" />
                    Managing Categories
                  </CardTitle>
                  <CardDescription>Classify your transactions with custom categories.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] w-full">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-foreground">1. Adding a Category</h3>
                        <p className="mt-2 text-muted-foreground">
                          - Visit the <strong>Categories</strong> page.
                          <br />- Click <strong>“Add Category”</strong>.
                          <br />- Specify name (e.g., “Food”), type (e.g., “expense”), and icon.
                          <br />- Save it.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-foreground">2. Editing a Category</h3>
                        <p className="mt-2 text-muted-foreground">
                          - Find the category and click <Edit className="inline h-4 w-4" />.
                          <br />- Update the name or icon, then save.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-foreground">3. Deleting a Category</h3>
                        <p className="mt-2 text-muted-foreground">
                          - Click <Trash className="inline h-4 w-4" /> next to the category.
                          <br />- Confirm deletion (note: only deletable categories can be removed).
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Budgets Tab */}
            <TabsContent value="budgets">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Managing Budgets
                  </CardTitle>
                  <CardDescription>Plan and control your spending with budgets.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] w-full">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-foreground">1. Setting a Budget</h3>
                        <p className="mt-2 text-muted-foreground">
                          - Go to the <strong>Budgets</strong> page.
                          <br />- Click <strong>“Create Budget”</strong>.
                          <br />- Choose a category, set a total amount, and define start/end dates.
                          <br />- Save to activate it.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-foreground">
                          2. Monitoring Your Budget
                        </h3>
                        <p className="mt-2 text-muted-foreground">
                          - View the budget card to see spent vs. total amount.
                          <br />- Transactions in the category auto-update the budget.
                        </p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-foreground">3. Adjusting a Budget</h3>
                        <p className="mt-2 text-muted-foreground">
                          - Click <Edit className="inline h-4 w-4" /> on the budget.
                          <br />- Modify the total or dates, then save.
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Separator */}
        <Separator className="my-12" />

        {/* Additional Resources */}
        <section className="text-center">
          <h2 className="mb-4 text-2xl font-semibold text-foreground">Need More Help?</h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            Check out our support page or contact us for further assistance.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground"
          >
            <Link href={`mailto:process.env.NEXT_PUBLIC_MAIL`}>
              <Mail className="mr-2 h-5 w-5" />
              Go to Support
            </Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-muted-foreground">
        <p className="text-sm">© {new Date().getFullYear()} Deewas. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default UserGuidePage
