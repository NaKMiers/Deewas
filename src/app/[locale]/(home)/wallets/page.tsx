'use client'

import CreateWalletDrawer from '@/components/dialogs/CreateWalletDrawer'
import NoItemsFound from '@/components/NoItemsFound'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import WalletCard from '@/components/WalletCard'
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { Link } from '@/i18n/navigation'
import { LucideChevronLeft, LucidePlus } from 'lucide-react'
import { useTranslations } from 'next-intl'

function WalletsPage() {
  // hooks
  const dispatch = useAppDispatch()
  const t = useTranslations('walletsPage')

  // store
  const { wallets } = useAppSelector(state => state.wallet)

  return (
    <div className="container min-h-[calc(100vh-50px)] p-21/2 md:p-21">
      {/* Top */}
      <div className="flex flex-row flex-wrap items-center gap-21/2">
        <Link
          href="/account"
          className="rounded-full bg-secondary p-1.5"
        >
          <LucideChevronLeft size={22} />
        </Link>
        <p className="pl-1 text-xl font-bold">{t('Wallets')}</p>
      </div>

      {wallets.length > 0 ? (
        <div className="mt-21 grid flex-col items-start gap-21 sm:grid-cols-2 lg:grid-cols-3">
          {wallets.map(wallet => (
            <WalletCard
              wallet={wallet}
              key={wallet._id}
            />
          ))}
        </div>
      ) : (
        <NoItemsFound
          className="mt-21 px-0"
          text={t("You don't have any wallets yet, create one now!")}
        />
      )}

      <Separator className="my-36 h-0" />

      {/* MARK: Create Wallet */}
      <CreateWalletDrawer
        trigger={
          <Button
            variant="default"
            className="fixed bottom-[calc(78px)] right-2 z-20 h-10 rounded-full xl:right-[calc(50%-640px+21px)]"
          >
            <LucidePlus size={24} />
            {t('Create Wallet')}
          </Button>
        }
      />
    </div>
  )
}

export default WalletsPage
