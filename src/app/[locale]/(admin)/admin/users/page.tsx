'use client'

import AdminMeta from '@/components/admin/AdminMeta'
import UserItem from '@/components/admin/UserItem'
import CustomInput from '@/components/CustomInput'
import Pagination from '@/components/Pagination'
import { useAppDispatch } from '@/hooks/reduxHook'
import { handleQuery } from '@/lib/query'
import { setPageLoading } from '@/lib/reducers/loadReducer'
import { IUser } from '@/models/UserModel'
import { getAllUsersApi } from '@/requests'
import { LucideSortAsc } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { FaSearch } from 'react-icons/fa'

function UsersPage({ searchParams }: { searchParams?: { [key: string]: string[] } }) {
  // hooks
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const router = useRouter()

  // states
  const [users, setUsers] = useState<IUser[]>([])
  const [amount, setAmount] = useState<number>(0)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // values
  const itemPerPage = 9

  // form
  const defaultValues = useMemo<FieldValues>(
    () => ({
      search: '',
      sort: 'updatedAt|-1',
      authType: 'all',
      role: 'all',
      isDeleted: 'all',
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
  // get all users
  useEffect(() => {
    // get all users
    const getAllUsers = async () => {
      const query = handleQuery(searchParams)

      // start page loading
      dispatch(setPageLoading(true))

      try {
        const { users, amount } = await getAllUsersApi(query)

        // set to states
        setUsers(users)
        setAmount(amount)

        // sync search params with states
        setValue('search', searchParams?.search || getValues('search'))
        setValue('sort', searchParams?.sort || getValues('sort'))
        setValue('authType', searchParams?.authType || getValues('authType'))
        setValue('role', searchParams?.role || getValues('role'))
        setValue('isDeleted', searchParams?.isDeleted || getValues('isDeleted'))
      } catch (err: any) {
        console.log(err)
      } finally {
        // stop page loading
        dispatch(setPageLoading(false))
      }
    }
    getAllUsers()
  }, [dispatch, searchParams, setValue, getValues])

  // handle select all users
  const handleSelectAllUsers = useCallback(() => {
    setSelectedUsers(
      selectedUsers.length > 0 ? [] : users.filter(user => user.role === 'user').map(user => user._id)
    )
  }, [users, selectedUsers.length])

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

      return {
        ...data,
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
        handleSelectAllUsers()
      }
    }

    // Add the event listener
    window.addEventListener('keydown', handleKeyDown)

    // Remove the event listener on cleanup
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleFilter, handleResetFilter, handleSelectAllUsers, handleSubmit])

  return (
    <div className="w-full p-21">
      {/* MARK: Filter */}
      <AdminMeta
        handleFilter={handleSubmit(handleFilter)}
        handleResetFilter={handleResetFilter}
        filterClassName="md:col-span-12"
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
        <div className="col-span-12 flex flex-wrap items-center gap-3 md:col-span-8">
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
          {/* Auth Type */}
          <CustomInput
            id="authType"
            label="Auth"
            inputClassName="bg-primary text-secondary"
            disabled={false}
            register={register}
            errors={errors}
            control={control}
            type="select"
            onFocus={() => clearErrors('authType')}
            options={[
              {
                value: 'all',
                label: 'All',
              },
              {
                value: 'google',
                label: 'Google',
              },
              {
                value: 'apple',
                label: 'Apple',
              },
            ]}
          />
          {/* Role */}
          <CustomInput
            id="role"
            label="Role"
            inputClassName="bg-primary text-secondary"
            disabled={false}
            register={register}
            errors={errors}
            control={control}
            type="select"
            onFocus={() => clearErrors('role')}
            options={[
              {
                value: 'all',
                label: 'All',
              },
              {
                value: 'user',
                label: 'User',
              },
              {
                value: 'admin',
                label: 'Admin',
              },
              {
                value: 'collaborator',
                label: 'Clb',
              },
            ]}
          />
          {/* Deleted */}
          <CustomInput
            id="isDeleted"
            label="Deleted"
            inputClassName="bg-primary text-secondary"
            disabled={false}
            register={register}
            errors={errors}
            control={control}
            type="select"
            onFocus={() => clearErrors('isDeleted')}
            options={[
              {
                value: 'all',
                label: 'All',
              },
              {
                value: 'true',
                label: 'Yes',
              },
              {
                value: 'false',
                label: 'No',
              },
            ]}
          />
        </div>

        {/* MARK: Action Buttons */}
        <div className="col-span-12 flex flex-wrap items-center justify-end gap-2 text-sm">
          {/* Select All Button */}
          <button
            className="trans-200 rounded-lg border border-sky-400 px-3 py-2 text-sky-400 hover:bg-sky-400 hover:text-white"
            onClick={handleSelectAllUsers}
          >
            {selectedUsers.length > 0 ? 'Unselect All' : 'Select All'}
          </button>
        </div>
      </AdminMeta>

      {/* MARK: Amount */}
      <div className="p-3 text-right text-sm font-semibold text-white">
        {Math.min(itemPerPage * +(searchParams?.page || 1), amount)}/{amount} user{amount !== 1 && 's'}
      </div>

      {/* MARK: MAIN LIST */}
      <div className="grid grid-cols-1 gap-21 md:grid-cols-2 lg:grid-cols-3">
        {users.map(user => (
          <UserItem
            data={user}
            // selected
            selectedItems={selectedUsers}
            setSelectedItems={setSelectedUsers}
            // functions
            key={user._id}
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

export default UsersPage
