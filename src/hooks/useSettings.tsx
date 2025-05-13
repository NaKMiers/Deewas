'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import { setLoading, setSettings } from '@/lib/reducers/settingsReducer'
import { getMySettingsApi } from '@/requests'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect } from 'react'

function useSettings() {
  // hooks
  const dispatch = useAppDispatch()
  const { data: session } = useSession()
  const user = session?.user

  // stores
  const { refreshPoint } = useAppSelector(state => state.load)
  const { settings, loading } = useAppSelector(state => state.settings)

  // get settings
  const getSettings = useCallback(async () => {
    if (!user) return

    // start loading
    dispatch(setLoading(true))

    try {
      // get settings
      const { settings } = await getMySettingsApi()
      dispatch(setSettings(settings))
    } catch (err: any) {
      console.log(err)
    } finally {
      // stop loading
      dispatch(setLoading(false))
    }
  }, [dispatch, user])

  // initial get settings
  useEffect(() => {
    getSettings()
  }, [dispatch, getSettings, user, refreshPoint])

  return { refetch: getSettings, settings, loading }
}

export default useSettings
