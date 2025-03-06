'use client'

import { GuageIcon, LightningIcon, LockIcon } from './icons'
import { motion } from 'framer-motion'
import { scaleLinear } from 'd3-scale'
import { Hub } from '@/app/[locale]/(ai)/ai/actions'

export const HubView = ({ hub }: { hub: Hub }) => {
  const countToHeight = scaleLinear().domain([0, hub.lights.length]).range([0, 32])

  return (
    <div className="flex w-full max-w-[calc(100dvw-80px)] flex-row gap-2 pb-6 md:max-w-[452px]">
      <motion.div
        className="flex flex-row items-center gap-3 rounded-md bg-zinc-100 p-2 dark:bg-zinc-800"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="rounded-md bg-blue-500 p-2 text-blue-50 dark:bg-blue-300 dark:text-blue-800">
          <GuageIcon />
        </div>
        <div>
          <div className="text-xs">Climate</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {`${hub.climate.low}-${hub.climate.high}°C`}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="flex flex-shrink-0 flex-row items-center gap-3 rounded-md bg-zinc-100 p-2 dark:bg-zinc-800"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div
          className={`relative size-8 rounded-md bg-zinc-300 p-2 text-zinc-50 dark:bg-zinc-200 dark:text-amber-900`}
        >
          <div className="absolute z-20 size-8">
            <LightningIcon />
          </div>
          <motion.div
            className={`absolute bottom-0 left-0 h-2 w-8 bg-amber-500 ${
              hub.lights.filter(hub => hub.status).length === hub.lights.length
                ? 'rounded-md'
                : 'rounded-b-md'
            }`}
            initial={{ height: 0 }}
            animate={{
              height: countToHeight(hub.lights.filter(hub => hub.status).length),
            }}
          />
        </div>
        <div>
          <div className="text-xs">Lights</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {`${hub.lights.filter(hub => hub.status).length}/${hub.lights.length} On`}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="flex flex-row items-center gap-3 rounded-md bg-zinc-100 p-2 dark:bg-zinc-800"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="rounded-md bg-green-600 p-2 text-green-100 dark:bg-green-200 dark:text-green-900">
          <LockIcon />
        </div>
        <div>
          <div className="text-xs">Security</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {`${hub.locks.filter(hub => hub.isLocked).length}/${hub.locks.length} Locked`}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
