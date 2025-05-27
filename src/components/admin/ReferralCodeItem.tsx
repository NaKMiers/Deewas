import useUtils from '@/hooks/useUtils'
import { cn } from '@/lib/utils'
import { IReferralCode } from '@/models/ReferralCodeModel'
import { IUser } from '@/models/UserModel'
import Link from 'next/link'
import React, { memo, useState } from 'react'
import { FaCheck, FaTrash } from 'react-icons/fa'
import { MdEdit } from 'react-icons/md'
import { RiDonutChartFill } from 'react-icons/ri'
import ConfirmDialog from '../dialogs/ConfirmDialog'
import { Button } from '../ui/button'

interface ReferralCodeItemProps {
  data: IReferralCode
  loadingReferralCodes: string[]
  className?: string

  selectedItems: string[]
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>

  handleActivateReferralCodes: (ids: string[], value: boolean) => void
  handleDeleteReferralCodes: (ids: string[]) => void
}

function ReferralCodeItem({
  data,
  loadingReferralCodes,
  className = '',
  // selected
  selectedItems,
  setSelectedItems,
  // functions
  handleActivateReferralCodes,
  handleDeleteReferralCodes,
}: ReferralCodeItemProps) {
  // hooks
  const { handleCopy } = useUtils()

  // states
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false)

  return (
    <div
      className={cn(
        'trans-200 relative flex cursor-pointer select-none items-start justify-between gap-2 rounded-lg border border-primary/10 bg-secondary p-4 shadow-lg',
        selectedItems.includes(data._id) && '-translate-y-1 bg-primary/20',
        className
      )}
      onClick={() =>
        setSelectedItems(prev =>
          prev.includes(data._id) ? prev.filter(id => id !== data._id) : [...prev, data._id]
        )
      }
    >
      {/* MARK: Body */}
      <div>
        <div className="flex items-center gap-3">
          {/* Code */}
          <p
            className="cursor-pointer font-semibold"
            title="code"
            onClick={e => {
              e.stopPropagation()
              handleCopy(data.code)
            }}
          >
            {data.code}
          </p>
        </div>

        {/* Desc */}
        {data.desc?.trim() && (
          <p
            className="text-sm"
            title="desc"
          >
            <span className="font-semibold">Desc: </span>
            <span
              className="cursor-pointer"
              onClick={e => {
                e.stopPropagation()
                handleCopy(data.desc)
              }}
            >
              {data.desc}
            </span>
          </p>
        )}

        {/* Owner */}
        <p
          className="text-sm"
          title="owner"
        >
          <span className="font-semibold">Owner: </span>
          <span
            className="cursor-pointer"
            onClick={e => {
              e.stopPropagation()
              handleCopy((data.owner as IUser)?.name)
            }}
          >
            {(data.owner as IUser).name}
          </span>
        </p>

        {/* Used Users */}
        <p
          className="text-sm"
          title="usedUsers"
        >
          <span className="font-semibold">Users: </span>
          <span>{data.usedUsers.length}</span>
        </p>
      </div>

      {/* MARK: Action Buttons */}
      <div className="flex flex-col gap-0.5 rounded-lg">
        {/* Active Button */}
        <Button
          variant="ghost"
          className="flex h-8 w-8"
          onClick={e => {
            e.stopPropagation()
            handleActivateReferralCodes([data._id], !data.active)
          }}
          title={data.active ? 'Deactivate' : 'Activate'}
        >
          <FaCheck
            size={18}
            className={cn(data.active ? 'text-green-500' : 'text-slate-300')}
          />
        </Button>

        {/* Edit Button Link */}
        <Link
          href={`/admin/referral-codes/${data.code}/edit`}
          className="flex h-8 w-8 items-center justify-center"
          onClick={e => e.stopPropagation()}
          title="Edit"
        >
          <MdEdit size={18} />
        </Link>

        {/* Delete Button */}
        <ConfirmDialog
          label="Delete Code"
          desc="Are you sure that you want to delete this code?"
          confirmLabel="Delete"
          onConfirm={() => handleDeleteReferralCodes([data._id])}
          trigger={
            <Button
              variant="ghost"
              className="h-8 w-8"
              onClick={e => e.stopPropagation()}
              disabled={loadingReferralCodes.includes(data._id)}
              title="Delete"
            >
              {loadingReferralCodes.includes(data._id) ? (
                <RiDonutChartFill className="animate-spin text-muted-foreground" />
              ) : (
                <FaTrash />
              )}
            </Button>
          }
        />
      </div>
    </div>
  )
}

export default memo(ReferralCodeItem)
