'use client'

import { useAppDispatch } from '@/hooks/reduxHook'
import { setExchangeRates, setLoading, setSettings } from '@/lib/reducers/settingsReducer'
import { getExchangeRatesApi, getMySettingsApi } from '@/requests'
import { useEffect } from 'react'

function UseSettings() {
  // hooks
  const dispatch = useAppDispatch()

  // get settings
  useEffect(() => {
    async function getSettings() {
      // start loading
      dispatch(setLoading(true))

      try {
        const [{ settings }, { rates }] = await Promise.all([getMySettingsApi(), getExchangeRatesApi()])

        dispatch(setSettings(settings))
        dispatch(setExchangeRates(rates))
      } catch (err: any) {
        console.log(err)
      } finally {
        // stop loading
        dispatch(setLoading(false))
      }
    }

    getSettings()
  }, [dispatch])

  return null
}

export default UseSettings
