import { cn } from '@/lib/utils'
import { memo, ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { Separator } from '../ui/separator'

interface ConfirmDialogProps {
  open?: boolean
  close?: (open: boolean) => void
  trigger?: ReactNode
  label: string
  desc: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  disabled?: boolean
  className?: string
}

function ConfirmDialog({
  open,
  close,
  trigger,
  label,
  desc,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  disabled = false,
  className,
}: ConfirmDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={close}
    >
      {trigger && (
        <AlertDialogTrigger
          asChild
          disabled={disabled}
          className={cn('h-full w-full', className)}
        >
          {trigger}
        </AlertDialogTrigger>
      )}

      <AlertDialogContent
        className="border-200/30 rounded-lg border"
        onClick={e => e.stopPropagation()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{label}</AlertDialogTitle>
          <AlertDialogDescription>{desc}</AlertDialogDescription>
        </AlertDialogHeader>
        <Separator className="h-px bg-slate-300/50" />
        <AlertDialogFooter className="flex flex-row items-center justify-end gap-2">
          <AlertDialogCancel className="mt-0 px-2 text-sm">{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            className="bg mt-0 px-2 text-sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default memo(ConfirmDialog)
