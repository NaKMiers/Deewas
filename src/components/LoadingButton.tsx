import { memo } from 'react'
import { RiDonutChartFill } from 'react-icons/ri'
import { Button } from './ui/button'

interface LoadingButtonProps {
  text: string
  isLoading: boolean
  onClick?: (e?: any) => void
  className?: string
}

function LoadingButton({ text, isLoading, onClick, className = '' }: LoadingButtonProps) {
  return (
    <Button
      variant="secondary"
      className={`${isLoading ? 'pointer-events-none flex justify-center' : ''} ${className}`}
      disabled={isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <RiDonutChartFill
          size={24}
          className="animate-spin"
        />
      ) : (
        text
      )}
    </Button>
  )
}

export default memo(LoadingButton)
