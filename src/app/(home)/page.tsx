'use client'

import History from '@/components/History'
import OverviewCard from '@/components/OverviewCard'
import Transactions from '@/components/Transactions'
import { Separator } from '@/components/ui/separator'
import Wallets from '@/components/Wallets'

function HomePage() {
  return (
    <div className="container pb-32">
      <OverviewCard />

      <Separator className="my-8 h-0" />

      <Wallets />

      <Separator className="my-8 h-0" />

      <History />

      <Separator className="my-8 h-0" />

      <Transactions />
    </div>
  )
}

export default HomePage
