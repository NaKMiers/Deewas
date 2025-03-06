'use client'

import Creations from '@/components/Creations'
import History from '@/components/History'
import LatestTransactions from '@/components/LatestTransactions'
import OverviewCard from '@/components/OverviewCard'
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

      <LatestTransactions />

      <Creations />
    </div>
  )
}

export default HomePage
