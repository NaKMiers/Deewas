'use client'

import CustomInput from '@/components/CustomInput'
import LoadingButton from '@/components/LoadingButton'
import { useAppDispatch } from '@/hooks/reduxHook'
import { setPageLoading } from '@/lib/reducers/loadReducer'
import { IUser } from '@/models/UserModel'
import { editUserApi, getUserApi } from '@/requests'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaUser } from 'react-icons/fa'
import { GoSingleSelect } from 'react-icons/go'
import { IoText } from 'react-icons/io5'
import { MdEmail } from 'react-icons/md'

function EditUserPage() {
  // hooks
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  // states
  const [user, setUser] = useState<IUser | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    control,
    reset,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues: {
      username: '',
      email: '',
      authType: '',
      name: '',
    },
  })

  // get user to edit
  useEffect(() => {
    const getUser = async () => {
      if (!id) return

      // star page loading
      dispatch(setPageLoading(true))

      try {
        const { user } = await getUserApi(id)

        // set user to state
        setUser(user)
        reset(user)
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        // stop page loading
        dispatch(setPageLoading(false))
      }
    }

    getUser()
  }, [dispatch, reset, id])

  // validate form
  const handleValidate: SubmitHandler<FieldValues> = useCallback(
    data => {
      let isValid = true

      // check if user is not found
      if (!user) {
        toast.error('User not found')
        return false
      }

      // only update if there is any change
      let countChanges: number = 0

      if (data.username !== user.username) countChanges++
      if (data.email !== user.email) countChanges++
      if (data.authType !== user.authType) countChanges++
      if (data.name !== user.name) countChanges++

      if (countChanges === 0) {
        toast.error('No changes to update')
        return false
      }

      return isValid
    },
    [user]
  )

  // MARK: Submit
  // send request to server to edit account
  const onSubmit: SubmitHandler<FieldValues> = async data => {
    // validate form
    if (!handleValidate(data)) return

    // start loading
    setLoading(true)

    try {
      const { message } = await editUserApi(id, data)

      // show success message
      toast.success(message)

      // reset form
      reset()
      dispatch(setPageLoading(false))

      // redirect back
      router.back()
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      // stop loading
      setLoading(false)
    }
  }

  return (
    <div className="w-full p-21">
      <div className="flex flex-col items-start gap-21 md:flex-row">
        <div className="relative mt-4 flex-shrink-0">
          <div className="aspect-square w-full max-w-[100px] overflow-hidden rounded-lg shadow-lg">
            <Image
              src={user?.avatar || process.env.NEXT_PUBLIC_DEFAULT_AVATAR!}
              height={200}
              width={200}
              alt="avatar"
              className="h-full w-full object-cover"
            />
          </div>

          {user?.role && (
            <div className="absolute -top-2 left-1/2 z-30 -translate-x-1/2 rounded-md bg-secondary px-1.5 py-[2px] font-body text-xs text-yellow-300 shadow-md">
              {user.role}
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            <CustomInput
              id="name"
              label="Name"
              disabled={loading}
              register={register}
              errors={errors}
              required
              type="text"
              icon={<IoText size={20} />}
              onFocus={() => clearErrors('name')}
            />
            <CustomInput
              id="authType"
              label="Auth Type"
              disabled={loading}
              register={register}
              errors={errors}
              required
              type="select"
              control={control}
              options={[
                { value: 'local', label: 'Local' },
                { value: 'google', label: 'Google' },
                { value: 'apple', label: 'Apple' },
              ]}
              icon={<GoSingleSelect size={20} />}
              onFocus={() => clearErrors('authType')}
            />
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <CustomInput
              id="username"
              label="Username"
              disabled={loading}
              register={register}
              errors={errors}
              required={!!user?.username}
              type="text"
              icon={<FaUser size={20} />}
              onFocus={() => clearErrors('username')}
            />
            <CustomInput
              id="email"
              label="Email"
              disabled={loading}
              register={register}
              errors={errors}
              required
              type="email"
              icon={<MdEmail size={20} />}
              onFocus={() => clearErrors('email')}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <LoadingButton
        className="mt-6 px-4 py-2"
        onClick={handleSubmit(onSubmit)}
        text="Save"
        isLoading={loading}
      />
    </div>
  )
}

export default EditUserPage
