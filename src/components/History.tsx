import { useAppSelector } from '@/hooks/reduxHook'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover'
import { ReactNode, useState } from 'react'
import Chart from './Chart'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface HistoryProps {
  className?: string
}

const types = ['balance', 'income', 'expense', 'saving', 'invest']
const charts = ['line', 'bar', 'area', 'radar']

function History({ className = '' }: HistoryProps) {
  // store
  const {
    settings: { currency },
    exchangeRates,
  } = useAppSelector(state => state.settings)

  // states
  const [chart, setChart] = useState<string>(charts[0])
  const [selectedTypes, setSelectedTypes] = useState<string[]>(types)

  return (
    <div className={cn('px-21/2 md:px-21', className)}>
      {/* Top */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">History</h2>
      </div>

      <div className="mt-1.5 rounded-lg border border-muted-foreground/50 px-0">
        <div className="flex flex-wrap justify-end gap-21/2 p-21/2">
          <MultipleSelection
            trigger={
              <Button
                variant="outline"
                className="h-9 px-21/2 text-sm font-semibold"
              >
                {selectedTypes.length} {selectedTypes.length !== 1 ? 'types' : 'type'}
              </Button>
            }
            list={types}
            selected={selectedTypes}
            onChange={(list: any[]) => setSelectedTypes(list)}
          />

          <Select
            value={chart}
            onValueChange={setChart}
          >
            <SelectTrigger className="max-w-max gap-1.5 font-semibold capitalize !ring-0">
              <SelectValue placeholder="Select Chart" />
            </SelectTrigger>
            <SelectContent className="">
              {charts.map(chart => (
                <SelectItem
                  key={chart}
                  value={chart}
                  className="cursor-pointer capitalize"
                >
                  {chart}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Chart
          chart={chart}
          types={selectedTypes}
          data={[
            {
              income: 1000,
              expense: 500,
              balance: 1000,
              saving: 500,
              invest: 500,
              name: 'Jan 1',
            },
            {
              income: 2000,
              expense: 1500,
              balance: 500,
              saving: 100,
              invest: 500,
              name: 'Jan 2',
            },
            {
              income: 3000,
              expense: 2000,
              balance: 1000,
              saving: 1000,
              invest: 500,
              name: 'Jan 3',
            },
            {
              income: 4000,
              expense: 2500,
              balance: 1500,
              saving: 1500,
              invest: 500,
              name: 'Jan 4',
            },
            {
              income: 5000,
              expense: 3000,
              balance: 5000,
              saving: 2000,
              invest: 200,
              name: 'Jan 5',
            },
            {
              income: 6000,
              expense: 3500,
              balance: 3000,
              saving: 2500,
              invest: 1000,
              name: 'Jan 6',
            },
            {
              income: 7000,
              expense: 4000,
              balance: 3000,
              saving: 3000,
              invest: 1000,
              name: 'Jan 7',
            },
            {
              income: 5000,
              expense: 4000,
              balance: 2000,
              saving: 1000,
              invest: 1000,
              name: 'Jan 8',
            },
            {
              income: 5000,
              expense: 4000,
              balance: 1000,
              saving: 1000,
              invest: 500,
              name: 'Jan 9',
            },
          ]}
          currency={currency}
          exchangeRate={exchangeRates[currency]}
          className="-ml-21 pr-21/2"
        />
      </div>
    </div>
  )
}

export default History

interface MultiSelectionProps {
  trigger: ReactNode
  list: any[]
  selected: any[]
  onChange: (value: any) => void
}

export function MultipleSelection({ trigger, list, selected, onChange }: MultiSelectionProps) {
  // states
  const [open, setOpen] = useState<boolean>(false)
  const isObjectItem = typeof list[0] === 'object'

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="z-10 mt-2 flex flex-col overflow-hidden rounded-sm border border-muted-foreground/50 shadow-md">
        <Button
          variant="outline"
          className={cn(
            'trans-200 h-8 justify-start rounded-none border-0 px-3 text-left text-sm font-light',
            selected.length === list.length && 'border-l-2 border-primary pl-2'
          )}
          onClick={selected.length === list.length ? () => onChange([]) : () => onChange(list)}
        >
          <span className="text-nowrap">All</span>
        </Button>
        {list.map((item, index) => (
          <Button
            variant="outline"
            className={cn(
              'trans-200 h-8 justify-start rounded-none border-0 px-3 text-left text-sm font-light',
              (isObjectItem
                ? selected.some((ele: any) => ele._id.toString() === item._id.toString())
                : selected.includes(item)) && 'border-l-2 border-primary pl-2'
            )}
            onClick={() => {
              if (isObjectItem) {
                if (selected.some((ele: any) => ele._id.toString() === item._id.toString())) {
                  return onChange(selected.filter(ele => ele._id.toString() !== item._id.toString()))
                } else {
                  return onChange([...selected, item])
                }
              } else {
                if (selected.includes(item)) {
                  return onChange(selected.filter(ele => ele !== item))
                } else {
                  return onChange([...selected, item])
                }
              }
            }}
            key={index}
          >
            <p className="text-nowrap capitalize">{isObjectItem ? item.name : item}</p>
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
