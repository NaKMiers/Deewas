'use client'

import Creations from '@/components/Creations'
import History from '@/components/History'
import LatestTransactions from '@/components/LatestTransactions'
import Overview from '@/components/Overview'
import { Separator } from '@/components/ui/separator'
import Wallets from '@/components/Wallets'

function HomePage() {
  return (
    <div className="container p-21/2 pb-32 md:p-21">
      <Overview />

      <Separator className="my-8 h-0" />

      <Wallets />

      <Separator className="my-8 h-0" />

      <History />

      <Separator className="my-8 h-0" />

      <LatestTransactions />

      <Separator className="my-24 h-0" />

      <Creations />
    </div>
  )
}

export default HomePage
