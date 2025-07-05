'use client'

import AdminMeta from '@/components/admin/AdminMeta'
import ReferralCodeItem from '@/components/admin/ReferralCodeItem'
import CustomInput from '@/components/CustomInput'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog'
import Pagination from '@/components/Pagination'
import { useAppDispatch } from '@/hooks/reduxHook'
import { handleQuery, searchParamsToSingleFieldObject } from '@/lib/query'
import { setPageLoading } from '@/lib/reducers/loadReducer'
import { toUTC } from '@/lib/time'
import { IReferralCode } from '@/models/ReferralCodeModel'
import { activateReferralCodesApi, deleteReferralCodesApi, getAllReferralCodesApi } from '@/requests'
import { LucideSortAsc } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaSearch } from 'react-icons/fa'

function ReferralCodesPage() {
  // store
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const router = useRouter()
  const params = useSearchParams()
  const searchParams: any = useMemo(() => searchParamsToSingleFieldObject(params), [params])

  // states
  const [referralCodes, setReferralCodes] = useState<IReferralCode[]>([])
  const [amount, setAmount] = useState<number>(0)
  const [selectedReferralCodes, setSelectedReferralCodes] = useState<string[]>([])

  // loading and confirming
  const [loadingReferralCodes, setLoadingReferralCodes] = useState<string[]>([])
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false)

  // values
  const itemPerPage = 9

  // form
  const defaultValues = useMemo<FieldValues>(
    () => ({
      search: '',
      sort: 'updatedAt|-1',
      active: '',
      beginFrom: '',
      beginTo: '',
    }),
    []
  )
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    reset,
    control,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues,
  })

  // MARK: Get Data
  // get all referral codes
  useEffect(() => {
    // get all referral codes
    const getAllReferralCodes = async () => {
      const query = handleQuery(searchParams)

      // start page loading
      dispatch(setPageLoading(true))

      try {
        const { referralCodes, amount } = await getAllReferralCodesApi(query) // cache: no-store

        // set referral codes to state
        setReferralCodes(referralCodes)
        setAmount(amount)

        // sync search params with states
        setValue('search', searchParams?.search || getValues('search'))
        setValue('sort', searchParams?.sort || getValues('sort'))
        setValue('active', searchParams?.active || getValues('active'))
      } catch (err: any) {
        console.log(err)
      } finally {
        // stop page loading
        dispatch(setPageLoading(false))
      }
    }
    getAllReferralCodes()
  }, [dispatch, searchParams, setValue, getValues])

  // MARK: Handlers
  // activate referralCode
  const handleActivateReferralCodes = useCallback(async (ids: string[], value: boolean) => {
    try {
      // send request to server
      const { updatedReferralCodes, message } = await activateReferralCodesApi(ids, value)

      // update referral codes from state
      setReferralCodes(prev =>
        prev.map(referralCode =>
          updatedReferralCodes
            .map((referralCode: IReferralCode) => referralCode._id)
            .includes(referralCode._id)
            ? { ...referralCode, active: value }
            : referralCode
        )
      )

      // show success message
      toast.success(message)
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    }
  }, [])

  // delete referralCode
  const handleDeleteReferralCodes = useCallback(async (ids: string[]) => {
    setLoadingReferralCodes(ids)

    try {
      // send request to server
      const { deletedReferralCodes, message } = await deleteReferralCodesApi(ids)
      // remove deleted referral codes from state
      setReferralCodes(prev =>
        prev.filter(
          referralCode =>
            !deletedReferralCodes
              .map((referralCode: IReferralCode) => referralCode._id)
              .includes(referralCode._id)
        )
      )
      // show success message
      toast.success(message)
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      setLoadingReferralCodes([])
      setSelectedReferralCodes([])
    }
  }, [])

  // handle optimize filter
  const handleOptimizeFilter: SubmitHandler<FieldValues> = useCallback(
    data => {
      // reset page
      if (searchParams?.page) {
        delete searchParams.page
      }

      // loop through data to prevent filter default
      for (let key in data) {
        if (data[key] === defaultValues[key]) {
          if (!searchParams?.[key]) {
            delete data[key]
          } else {
            data[key] = ''
          }
        }
      }

      const { beginFrom, beginTo, expireFrom, expireTo, ...rest } = data
      if (beginFrom || beginTo) {
        rest.begin = (beginFrom ? toUTC(beginFrom) : '') + '|' + (beginTo ? toUTC(beginTo) : '')
      }

      if (expireFrom || expireTo) {
        rest.expire = (expireFrom ? toUTC(expireFrom) : '') + '|' + (expireTo ? toUTC(expireTo) : '')
      }

      return {
        ...rest,
      }
    },
    [searchParams, defaultValues]
  )

  // handle submit filter
  const handleFilter: SubmitHandler<FieldValues> = useCallback(
    async data => {
      const params: any = handleOptimizeFilter(data)

      // handle query
      const query = handleQuery({
        ...searchParams,
        ...params,
      })

      // push to router
      router.push(pathname + query)
    },
    [handleOptimizeFilter, router, searchParams, pathname]
  )

  // handle reset filter
  const handleResetFilter = useCallback(() => {
    reset()
    router.push(pathname)
  }, [reset, router, pathname])

  // keyboard event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + A (Select All)
      if (e.altKey && e.key === 'a') {
        e.preventDefault()
        setSelectedReferralCodes(prev =>
          prev.length === referralCodes.length ? [] : referralCodes.map(referralCode => referralCode._id)
        )
      }

      // Alt + Delete (Delete)
      if (e.altKey && e.key === 'Delete') {
        e.preventDefault()
        setIsOpenConfirmModal(true)
      }
    }

    // Add the event listener
    window.addEventListener('keydown', handleKeyDown)

    // Remove the event listener on cleanup
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleFilter, handleResetFilter, handleSubmit, referralCodes])

  return (
    <div className="w-full p-21">
      {/* MARK: Filter */}
      <AdminMeta
        handleFilter={handleSubmit(handleFilter)}
        handleResetFilter={handleResetFilter}
      >
        {/* Search */}
        <div className="col-span-12 flex flex-col md:col-span-4">
          <CustomInput
            id="search"
            className="md:max-w-[450px]"
            inputClassName="bg-primary text-secondary"
            label="Search"
            disabled={false}
            register={register}
            errors={errors}
            type="text"
            icon={<FaSearch size={20} />}
            onFocus={() => clearErrors('search')}
          />
        </div>

        {/* MARK: Select Filter */}
        <div className="col-span-12 flex flex-wrap items-center gap-3 md:col-span-4">
          {/* Sort */}
          <CustomInput
            id="sort"
            label="Sort"
            inputClassName="bg-primary text-secondary"
            disabled={false}
            register={register}
            errors={errors}
            icon={<LucideSortAsc size={20} />}
            control={control}
            type="select"
            onFocus={() => clearErrors('sort')}
            options={[
              {
                value: 'createdAt|-1',
                label: 'Newest',
              },
              {
                value: 'createdAt|1',
                label: 'Oldest',
              },
              {
                value: 'updatedAt|-1',
                label: 'Latest',
                selected: true,
              },
              {
                value: 'updatedAt|1',
                label: 'Earliest',
              },
            ]}
          />
        </div>

        {/* MARK: Action Buttons */}
        <div className="col-span-12 flex flex-wrap items-center justify-end gap-2 text-sm">
          {/* Select All Button */}
          <button
            className="trans-200 rounded-lg border border-sky-400 px-3 py-2 text-sky-400 hover:bg-sky-400 hover:text-white"
            onClick={() =>
              setSelectedReferralCodes(
                selectedReferralCodes.length > 0
                  ? []
                  : referralCodes.map(referralCode => referralCode._id)
              )
            }
          >
            {selectedReferralCodes.length > 0 ? 'Unselect All' : 'Select All'}
          </button>

          {/* Activate Many Button */}
          {selectedReferralCodes.some(
            id => !referralCodes.find(referralCode => referralCode._id === id)?.active
          ) && (
            <button
              className="trans-200 rounded-lg border border-green-400 px-3 py-2 text-green-400 hover:bg-green-400 hover:text-white"
              onClick={() => handleActivateReferralCodes(selectedReferralCodes, true)}
            >
              Activate
            </button>
          )}

          {/* Deactivate Many Button */}
          {selectedReferralCodes.some(
            id => referralCodes.find(referralCode => referralCode._id === id)?.active
          ) && (
            <button
              className="trans-200 rounded-lg border border-red-500 px-3 py-2 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={() => handleActivateReferralCodes(selectedReferralCodes, false)}
            >
              Deactivate
            </button>
          )}

          {/* Delete Many Button */}
          {!!selectedReferralCodes.length && (
            <button
              className="trans-200 rounded-lg border border-red-500 px-3 py-2 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={() => setIsOpenConfirmModal(true)}
            >
              Delete
            </button>
          )}
        </div>
      </AdminMeta>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={isOpenConfirmModal}
        close={() => setIsOpenConfirmModal(false)}
        label="Delete Referral Codes"
        confirmLabel="Delete"
        desc="Are you sure that you want to delete these referral codes?"
        onConfirm={() => handleDeleteReferralCodes(selectedReferralCodes)}
      />

      {/* MARK: Amount */}
      <div className="p-3 text-right text-sm font-semibold text-white">
        {Math.min(itemPerPage * +(searchParams?.page || 1), amount)}/{amount} referral code
        {amount !== 1 ? 's' : ''}
      </div>

      {/* MARK: MAIN LIST */}
      <div className="grid grid-cols-1 gap-21 md:grid-cols-2 lg:grid-cols-3">
        {referralCodes.map(referralCode => (
          <ReferralCodeItem
            data={referralCode}
            loadingReferralCodes={loadingReferralCodes}
            selectedItems={selectedReferralCodes}
            setSelectedItems={setSelectedReferralCodes}
            handleActivateReferralCodes={handleActivateReferralCodes}
            handleDeleteReferralCodes={handleDeleteReferralCodes}
            key={referralCode._id}
          />
        ))}
      </div>

      {/* MARK: Pagination */}
      <Pagination
        className="mt-8"
        searchParams={searchParams}
        amount={amount}
        itemsPerPage={itemPerPage}
      />
    </div>
  )
}

export default ReferralCodesPage
