'use client'

import { useAppSelector } from '@/hooks/reduxHook'
import { capitalize, checkTranType, formatCompactNumber, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { TransactionType } from '@/models/TransactionModel'
import { useTheme } from 'next-themes'
import { memo, useCallback } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export type ChartDatum = {
  name: string
  income: number
  expense: number
  balance: number
  saving: number
  invest: number
}

interface ChartProps {
  chart: string
  types: TransactionType[]
  data: any[]
  className?: string
  maxKey: string
}

function Chart({ maxKey, types, chart, data = [], className }: ChartProps) {
  // hooks
  const { resolvedTheme } = useTheme()

  // store
  const currency = useAppSelector(state => state.settings.settings?.currency)

  const formatTooltip = useCallback(
    (value: number, name: string) => {
      const formattedValue = currency ? formatCurrency(currency, value) : 0
      return [`${capitalize(name as string)}: ${formattedValue}`]
    },
    [currency]
  )

  const renderChart = useCallback(() => {
    switch (chart) {
      // MARK: Bar
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              fontSize={10}
            />
            <YAxis
              dataKey={maxKey}
              tickLine={false}
              axisLine={false}
              fontSize={10}
              tickFormatter={value => formatCompactNumber(value, false)}
            />
            {types.map((type: any) => (
              <Bar
                dataKey={type}
                fill={checkTranType(type).hex}
                radius={[2, 2, 0, 0]}
                barSize={30}
                key={type}
              />
            ))}
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.1)' }}
              animationEasing="ease-in-out"
              animationDuration={200}
              formatter={formatTooltip}
              labelStyle={{ color: '#01dbe5' }}
              contentStyle={{
                fontSize: 13,
                background: resolvedTheme === 'dark' ? '#171717' : '#fff',
                borderRadius: 8,
                border: 'none',
                boxShadow: '0px 5px 5px 2px rgba(0, 0, 0, 0.2)',
              }}
            />
          </BarChart>
        )

      // MARK: Area
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              dataKey={maxKey}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={value => formatCompactNumber(value, false)}
            />

            {types.map((type: any) => (
              <Area
                type="monotone"
                dataKey={type}
                stroke={checkTranType(type).hex}
                fill={checkTranType(type).hex + 20}
                strokeWidth={2}
                dot={{ stroke: checkTranType(type).hex, strokeWidth: 1, r: 4 }}
                activeDot={{ r: 6 }}
                key={type}
              />
            ))}
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.1)' }}
              animationEasing="ease-in-out"
              animationDuration={200}
              formatter={formatTooltip}
              labelStyle={{ color: '#01dbe5' }}
              contentStyle={{
                fontSize: 13,
                background: resolvedTheme === 'dark' ? '#171717' : '#fff',
                borderRadius: 8,
                border: 'none',
                boxShadow: '0px 5px 5px 2px rgba(0, 0, 0, 0.2)',
              }}
            />
          </AreaChart>
        )

      // MARK: Radar
      case 'radar':
        return (
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis
              dataKey="name"
              fontSize={12}
            />
            <PolarRadiusAxis tickFormatter={value => formatCompactNumber(value, false)} />
            {types.map((type: any) => (
              <Radar
                dataKey={type}
                stroke={checkTranType(type).hex}
                fill={checkTranType(type).hex + 20}
                fillOpacity={0.6}
                key={type}
              />
            ))}
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.1)' }}
              animationEasing="ease-in-out"
              animationDuration={200}
              formatter={formatTooltip}
              labelStyle={{ color: '#01dbe5' }}
              contentStyle={{
                fontSize: 13,
                background: resolvedTheme === 'dark' ? '#171717' : '#fff',
                borderRadius: 8,
                border: 'none',
                boxShadow: '0px 5px 5px 2px rgba(0, 0, 0, 0.2)',
              }}
            />
          </RadarChart>
        )

      // MARK: Pie
      case 'pie':
        const pieData = types
          .map(type => ({
            name: capitalize(type),
            value: data.reduce((sum: number, item: any) => sum + (item[type] || 0), 0),
          }))
          .filter(item => item.value > 0)

        return (
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, value }) => `${name}: ${formatCompactNumber(value, false)}`}
            >
              {pieData.map((entry: any, index) => (
                <Cell
                  key={index}
                  fill={checkTranType(entry.name.toLowerCase()).hex}
                />
              ))}
            </Pie>
            <Tooltip
              animationEasing="ease-in-out"
              animationDuration={200}
              formatter={formatTooltip}
              labelStyle={{ color: '#01dbe5' }}
              contentStyle={{
                fontSize: 13,
                background: resolvedTheme === 'dark' ? '#171717' : '#fff',
                borderRadius: 8,
                border: 'none',
                boxShadow: '0px 5px 5px 2px rgba(0, 0, 0, 0.2)',
              }}
            />
          </PieChart>
        )

      default:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={'name'}
              tickLine={false}
              axisLine={false}
              fontSize={10}
            />
            <YAxis
              dataKey={maxKey}
              tickLine={false}
              axisLine={false}
              fontSize={10}
              domain={['dataMin', 'dataMax']}
              tickFormatter={value => formatCompactNumber(value, false)}
            />
            {types.map((type: any) => (
              <Line
                type="monotone"
                dataKey={type}
                stroke={checkTranType(type).hex}
                strokeWidth={2}
                dot={{ stroke: checkTranType(type).hex, strokeWidth: 1, r: 4 }}
                activeDot={{ r: 6 }}
                key={type}
              />
            ))}
            <Tooltip
              cursor={{
                stroke: '#ddd',
                strokeWidth: 2,
                fill: '#111',
                radius: 4,
                className: 'transition-all duration-75 ',
              }}
              animationEasing="ease-in-out"
              animationDuration={200}
              formatter={formatTooltip}
              labelStyle={{ color: '#01dbe5' }}
              contentStyle={{
                fontSize: 13,
                background: resolvedTheme === 'dark' ? '#171717' : '#fff',
                borderRadius: 8,
                border: 'none',
                boxShadow: '0px 5px 5px 2px rgba(0, 0, 0, 0.2)',
              }}
            />
          </LineChart>
        )
    }
  }, [formatTooltip, chart, data, types, maxKey, resolvedTheme])

  return (
    <div className={cn('relative', className)}>
      <ResponsiveContainer
        width="100%"
        height={380}
      >
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}

export default memo(Chart)
