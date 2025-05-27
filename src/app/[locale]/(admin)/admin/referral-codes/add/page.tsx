'use client'

import CustomInput from '@/components/CustomInput'
import LoadingButton from '@/components/LoadingButton'
import { generateRandomString } from '@/lib/string'
import { IUser } from '@/models/UserModel'
import { addReferralCodeApi, getRoleUsersApi } from '@/requests'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaQuoteRight, FaUserEdit } from 'react-icons/fa'
import { FaPlay } from 'react-icons/fa6'

import { RiCharacterRecognitionLine } from 'react-icons/ri'

function AddReferralCodePage() {
  // store
  const [roleUsers, setRoleUsers] = useState<IUser[]>([])

  // states
  const [loading, setLoading] = useState<boolean>(false)

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
    control,
    setError,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      code: generateRandomString(5).toUpperCase(),
      description: '',
      owner: 'all',
      active: true,
    },
  })

  // MARK: Get Data
  // get roleUsers, admins, editors
  useEffect(() => {
    const getRoleUsers = async () => {
      try {
        // send request to server to get role-users
        const { roleUsers } = await getRoleUsersApi()

        console.log(roleUsers)

        // set roleUsers to state
        setRoleUsers(roleUsers)
        setValue('owner', roleUsers.find((user: IUser) => user.role === 'admin')._id)
      } catch (err: any) {
        console.log(err)
      }
    }
    getRoleUsers()
  }, [setValue])

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true
      // code >= 5
      if (data.code.length < 5) {
        setError('code', {
          type: 'manual',
          message: 'Code must be at least 5 characters',
        })
        isValid = false
      } else {
        // code < 10
        if (data.code.length > 10) {
          setError('code', {
            type: 'manual',
            message: 'Code must be at most 10 characters',
          })
          isValid = false
        }
      }

      return isValid
    },
    [setError]
  )

  // MARK: Submit
  // handle send request to server to add ReferralCode
  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async data => {
      // validate form
      if (!handleValidate(data)) return

      setLoading(true)

      try {
        const { message } = await addReferralCodeApi(data)

        // show success message
        toast.success(message)
        // reset form
        reset()
        setValue('code', generateRandomString(5).toUpperCase())
        const adminUser = roleUsers.find((user: IUser) => user.role === 'admin')
        if (adminUser) {
          setValue('owner', adminUser._id)
        }
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    },
    [handleValidate, reset, setValue, roleUsers]
  )

  // Enter key to submit
  useEffect(() => {
    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleSubmit(onSubmit)()
    }

    window.addEventListener('keydown', handleEnter)
    return () => window.removeEventListener('keydown', handleEnter)
  }, [handleSubmit, onSubmit])

  return (
    <div className="p-21">
      <div className="mt-5">
        <div className="b-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Code */}
          <CustomInput
            id="code"
            label="Code"
            disabled={loading}
            register={register}
            errors={errors}
            required
            type="text"
            inputClassName="uppercase"
            icon={<RiCharacterRecognitionLine size={20} />}
            onFocus={() => clearErrors('code')}
          />

          {/* Owner */}
          <CustomInput
            id="owner"
            label="Owner"
            disabled={loading}
            register={register}
            errors={errors}
            required
            control={control}
            type="select"
            onFocus={() => clearErrors('owner')}
            options={roleUsers.map(user => ({
              value: user._id,
              label: `${user.name} - (${user.role.charAt(0).toUpperCase() + user.role.slice(1)})`,
            }))}
            icon={<FaUserEdit size={20} />}
            className="mb-5"
          />
        </div>

        {/* Description */}
        <CustomInput
          id="description"
          label="Description"
          disabled={loading}
          register={register}
          errors={errors}
          type="textarea"
          icon={<FaQuoteRight size={24} />}
          className="mb-5"
          onFocus={() => clearErrors('description')}
        />

        {/* Active */}
        <div className="flex h-9">
          <div className="flex items-center rounded-lg bg-white px-2.5">
            <FaPlay
              size={14}
              className="text-secondary"
            />
          </div>
          <input
            className="peer"
            type="checkbox"
            id="active"
            hidden
            {...register('active', { required: false })}
          />
          <label
            className="trans-200 flex cursor-pointer select-none items-center rounded-lg border border-green-500 bg-white px-4 text-green-500 peer-checked:bg-green-500 peer-checked:text-white"
            htmlFor="active"
          >
            Active
          </label>
        </div>

        {/* MARK: Add Button */}
        <LoadingButton
          className="mt-4"
          onClick={handleSubmit(onSubmit)}
          text="Add"
          isLoading={loading}
        />
      </div>
    </div>
  )
}

export default AddReferralCodePage
