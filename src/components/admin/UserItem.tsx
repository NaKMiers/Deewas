import useUtils from '@/hooks/useUtils'
import { Link } from '@/i18n/navigation'
import { formatTime } from '@/lib/time'
import { cn } from '@/lib/utils'
import { IUser } from '@/models/UserModel'
import { deleteUsersApi, restoreUserApi } from '@/requests/adminRequest'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Dispatch, memo, SetStateAction, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { FaAngleDoubleUp, FaTrash } from 'react-icons/fa'
import { MdEdit } from 'react-icons/md'
import { RiDonutChartFill } from 'react-icons/ri'
import { TbRestore } from 'react-icons/tb'
import ConfirmDialog from '../dialogs/ConfirmDialog'
import { Button } from '../ui/button'
import UpgradePlanModal from './UpgradePlanModal'

interface UserItemProps {
  data: IUser
  className?: string

  selectedItems: string[]
  setSelectedItems: Dispatch<SetStateAction<string[]>>
}

function UserItem({
  data,
  className = '',
  // selected
  selectedItems,
  setSelectedItems,
  // functions
}: UserItemProps) {
  // hooks
  const { handleCopy } = useUtils()
  const { data: session } = useSession()
  const curUser: any = session?.user

  // states
  const [user, setUser] = useState<IUser>(data)
  const [deleting, setDeleting] = useState<boolean>(false)

  // values
  const isCurUser = user._id === curUser?._id

  const plans: any = {
    free: 'Free',
    'premium-monthly': 'Monthly Premium',
    'premium-yearly': 'Yearly Premium',
    'premium-lifetime': 'Lifetime Premium',
  }

  // MARK: Delete User
  const handleDeleteUser = useCallback(async () => {
    setDeleting(true)

    try {
      // send request to server
      const { message } = await deleteUsersApi(user._id)

      // remove deleted users from state
      setSelectedItems(prev => prev.filter(id => id !== user._id))
      setUser(prev => ({ ...prev, isDeleted: true }))

      // show success message
      toast.success(message)
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      setDeleting(false)
      setSelectedItems(prev => prev.filter(id => id !== user._id))
    }
  }, [user, setSelectedItems])

  // MARK: Restore User
  const handleRestore = useCallback(async () => {
    setDeleting(true)

    try {
      // send request to server
      const { user: u, message } = await restoreUserApi(user._id)

      // remove deleted users from state
      setSelectedItems(prev => prev.filter(id => id !== user._id))
      setUser(u)

      // show success message
      toast.success(message)
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      setDeleting(false)
      setSelectedItems(prev => prev.filter(id => id !== user._id))
    }
  }, [user, setSelectedItems])

  return (
    <div
      className={cn(
        'trans-200 relative flex select-none items-start justify-between gap-2 rounded-lg border border-primary/10 bg-secondary p-4 shadow-lg',
        selectedItems.includes(user._id) && '-translate-y-1 bg-primary/20',
        !isCurUser && 'cursor-pointer',
        className
      )}
      onClick={() =>
        !isCurUser &&
        setSelectedItems(prev =>
          prev.includes(user._id) ? prev.filter(id => id !== user._id) : [...prev, user._id]
        )
      }
    >
      {/* MARK: Body */}
      <div className="flex-1 overflow-hidden">
        {/* Avatar */}
        {user.avatar && (
          <Image
            className="float-start mr-3 aspect-square rounded-md"
            src={user.avatar}
            height={60}
            width={60}
            alt="thumbnail"
            title={user._id}
          />
        )}

        {/* Information */}
        <div className="absolute -left-2 -top-2 z-30 select-none rounded-lg border border-primary/10 bg-secondary px-2 py-[2px] font-body text-xs text-yellow-300 shadow-md">
          {user.role}
        </div>
        <div className="absolute -right-2 -top-2 z-30 select-none rounded-lg border border-primary/10 bg-primary px-2 py-[2px] font-body text-xs text-sky-500 shadow-md">
          {user.authType}
        </div>

        <p
          className="inline-block rounded-lg border border-primary bg-primary-foreground px-21/2 py-1 text-xs font-semibold"
          title={user.email}
          onClick={e => {
            e.stopPropagation()
            handleCopy(user.email)
          }}
        >
          {plans[user.plan]}
        </p>

        <p
          className="line-clamp-1 block cursor-pointer text-ellipsis font-body text-[18px] font-semibold tracking-wide"
          title={user.email}
          onClick={e => {
            e.stopPropagation()
            handleCopy(user.email)
          }}
        >
          {user.email}
        </p>
        {user.username && (
          <p className="text-sm">
            <span className="font-medium">Username: </span>
            <span
              className="cursor-pointer"
              onClick={e => {
                e.stopPropagation()
                handleCopy(user.username as string)
              }}
            >
              {user.username}
            </span>
          </p>
        )}
        {user.name && (
          <p className="text-sm">
            <span className="font-medium">Name: </span>
            <span
              className="cursor-pointer"
              onClick={e => {
                e.stopPropagation()
                handleCopy(user.name)
              }}
            >
              {user.name}
            </span>
          </p>
        )}
        <p className="text-sm">
          <span className="font-medium">Created At: </span>
          <span
            className={`cursor-pointer ${
              +new Date() - +new Date(user.createdAt) <= 60 * 60 * 1000 ? 'text-yellow-500' : ''
            }`}
            onClick={e => {
              e.stopPropagation()
              handleCopy(formatTime(user.createdAt))
            }}
          >
            {formatTime(user.createdAt)}
          </span>
        </p>
        <p className="text-sm">
          <span className="font-medium">Updated At: </span>
          <span
            className={`cursor-pointer ${
              +new Date() - +new Date(user.updatedAt) <= 60 * 60 * 1000 ? 'text-yellow-500' : ''
            }`}
            onClick={e => {
              e.stopPropagation()
              handleCopy(formatTime(user.updatedAt))
            }}
          >
            {formatTime(user.updatedAt)}
          </span>
        </p>
        {user.isDeleted && <p className="text-sm font-semibold text-rose-500">Deleted</p>}
      </div>

      {/* MARK: Action Buttons*/}
      <div className="flex flex-shrink-0 flex-col gap-0.5 rounded-lg py-3">
        {/* Edit Button */}
        <Link
          href={`/admin/users/${user._id}/edit`}
          className="flex h-8 w-8 items-center justify-center"
          onClick={e => e.stopPropagation()}
          title="Edit"
        >
          <MdEdit size={18} />
        </Link>

        {/* Delete Button */}
        {!isCurUser && (
          <ConfirmDialog
            label={user.isDeleted ? 'Restore User' : 'Delete User'}
            desc={
              user.isDeleted
                ? 'Are you sure that you want to restore this user?'
                : 'Are you sure that you want to delete this user?'
            }
            confirmLabel={user.isDeleted ? 'Restore' : 'Delete'}
            onConfirm={user.isDeleted ? handleRestore : handleDeleteUser}
            trigger={
              <Button
                variant="ghost"
                className="h-8 w-8"
                onClick={e => e.stopPropagation()}
                disabled={deleting}
                title={user.isDeleted ? 'Restore' : 'Delete'}
              >
                {deleting ? (
                  <RiDonutChartFill className="animate-spin text-muted-foreground" />
                ) : user.isDeleted ? (
                  <TbRestore />
                ) : (
                  <FaTrash />
                )}
              </Button>
            }
          />
        )}
        <UpgradePlanModal
          user={user}
          updateUser={user => setUser(user)}
          trigger={
            <Button
              variant="ghost"
              className="h-8 w-8"
              onClick={e => e.stopPropagation()}
              disabled={deleting}
              title="Upgrade"
            >
              <FaAngleDoubleUp />
            </Button>
          }
        />
      </div>
    </div>
  )
}

export default memo(UserItem)
