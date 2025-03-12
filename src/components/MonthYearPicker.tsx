import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getLocale } from '@/lib/string'
import { format } from 'date-fns'
import { LucideCalendarFold, LucideChevronDown } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { memo, useCallback, useState } from 'react'

interface MonthYearPickerProps {
  currentMonth: Date
  setCurrentMonth: (date: Date) => void
}

function MonthYearPicker({ currentMonth, setCurrentMonth }: MonthYearPickerProps) {
  // hooks
  const locale = useLocale()
  const t = useTranslations('montYearPicker')

  // states
  const [open, setOpen] = useState<boolean>(false)
  const [newMonth, setNewMonth] = useState<number>(currentMonth.getMonth())
  const [newYear, setNewYear] = useState<number>(currentMonth.getFullYear())

  // Helper function to get month names based on locale
  const getMonthNames = (locale: string) => {
    const months = []
    for (let i = 0; i < 12; i++) {
      const date = new Date(2021, i, 1)
      months.push({
        value: i.toString(),
        label: format(date, 'MMMM', { locale: getLocale(locale) }),
      })
    }
    return months
  }

  const handleApply = useCallback(() => {
    const newDate = new Date(newYear, newMonth)
    setCurrentMonth(newDate)
    setOpen(false)
  }, [newMonth, newYear, setCurrentMonth])

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      {/* MARK: Trigger */}
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 text-lg font-normal"
        >
          <LucideCalendarFold size={20} />
          <span className="text-sm capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: getLocale(locale) })}
          </span>
          <LucideChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-4"
        align="start"
      >
        <div className="grid gap-4">
          {/* MARK: Month */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Month</h4>
            <Select
              value={newMonth.toString()}
              onValueChange={value => setNewMonth(+value)}
            >
              <SelectTrigger className="capitalize">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {getMonthNames(locale).map(month => (
                  <SelectItem
                    key={month.value}
                    value={month.value}
                    className="capitalize"
                  >
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* MARK: Year */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Year</h4>
            <Input
              type="number"
              min="1900"
              max="2100"
              value={newYear}
              onChange={e => setNewYear(+e.target.value)}
            />
          </div>
          <Button
            onClick={handleApply}
            className="w-full"
          >
            {t('Apply')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default memo(MonthYearPicker)
