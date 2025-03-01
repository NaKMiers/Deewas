'use client'

import { useAppDispatch } from '@/hooks/reduxHook'
import { setExchangeRates, setLoading, setSettings } from '@/lib/reducers/settingsReducer'
import { getExchangeRatesApi, getMySettingsApi } from '@/requests'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

function UseSettings() {
  // hooks
  const dispatch = useAppDispatch()
  const { data: session } = useSession()
  const user: any = session?.user

  // get settings
  useEffect(() => {
    async function getSettings() {
      if (!user) return

      // start loading
      dispatch(setLoading(true))

      try {
        const { settings } = await getMySettingsApi()
        dispatch(setSettings(settings))

        // const { rates } = await getExchangeRatesApi()
        // dispatch(setExchangeRates(rates))
      } catch (err: any) {
        console.log(err)
      } finally {
        // stop loading
        dispatch(setLoading(false))
      }
    }

    getSettings()
  }, [dispatch, user])

  return null
}

export default UseSettings
