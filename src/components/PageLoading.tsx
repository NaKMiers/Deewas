'use client'

import { useAppSelector } from '@/hooks/reduxHook'
import { memo } from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

function Loading() {
  // hooks
  const isPageLoading = useAppSelector(state => state.load.isPageLoading)

  return (
    <div
      className={`${
        isPageLoading ? 'flex' : 'hidden'
      } fixed bottom-0 left-0 right-0 top-0 z-50 h-screen w-screen items-center justify-center bg-black bg-opacity-30`}
    >
      <div className="relative flex items-center justify-center">
        <AiOutlineLoading3Quarters
          size={48}
          className="animate-spin text-white"
        />
        <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-white" />
      </div>
    </div>
  )
}

export default memo(Loading)
