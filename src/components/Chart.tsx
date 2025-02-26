'use client'

import { capitalize, formatCurrency } from '@/lib/string'
import { cn } from '@/lib/utils'
import { TransactionType } from '@/models/TransactionModel'
import { memo, useCallback } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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
}

export type ChartType = 'Line' | 'Bar' | 'Area' | 'Radar'

interface ChartProps {
  shows: boolean[]
  maxKey: TransactionType
  chart: ChartType
  data: any[]
  className?: string
  userSettings: any
  exchangeRate: number
}

const COLORS = ['#111', '#01dbe5', '#ff6347', '#ffa500', '#8a2be2']
function Chart({
  shows,
  chart,
  data = [],
  maxKey,
  userSettings,
  exchangeRate,
  className = '',
}: ChartProps) {
  const formatTooltip = useCallback(
    (value: number, name: string) => {
      const formattedValue = formatCurrency(userSettings.currency, value as number, exchangeRate)
      return [`${capitalize(name as string)}: ${formattedValue}`]
    },
    [userSettings, exchangeRate]
  )

  return (
    <div className={cn('relative', className)}>
      <ResponsiveContainer
        width="100%"
        height={500}
      >
        {chart === 'Line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={'name'}
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              dataKey={maxKey}
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            {shows[0] && (
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ stroke: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            {shows[1] && (
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#F43F5E"
                strokeWidth={2}
                dot={{ stroke: '#F43F5E', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            <Tooltip
              cursor={{
                stroke: '#ddd',
                strokeWidth: 2,
                fill: '#111',
                radius: 4,
                className: 'transition-all duration-75',
              }}
              animationEasing="ease-in-out"
              animationDuration={200}
              formatter={formatTooltip}
              labelStyle={{ color: '#01dbe5' }}
              contentStyle={{
                background: '#333',
                borderRadius: 8,
                border: 'none',
                boxShadow: '0px 14px 10px 5px rgba(0, 0, 0, 0.2)',
              }}
            />
          </LineChart>
        ) : chart === 'Bar' ? (
          <BarChart data={data}>
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
            />
            {shows[0] && (
              <Bar
                dataKey="income"
                fill="#10B981"
                radius={[6, 6, 0, 0]}
                barSize={30}
              />
            )}
            {shows[1] && (
              <Bar
                dataKey="expense"
                fill="#F43F5E"
                radius={[6, 6, 0, 0]}
                barSize={30}
              />
            )}
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.1)' }}
              animationEasing="ease-in-out"
              animationDuration={200}
              formatter={formatTooltip}
              labelStyle={{ color: '#01dbe5' }}
              contentStyle={{
                background: '#333',
                borderRadius: 8,
                border: 'none',
                boxShadow: '0px 14px 10px 5px rgba(0, 0, 0, 0.2)',
              }}
            />
          </BarChart>
        ) : chart === 'Area' ? (
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
            />
            {shows[0] && (
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                strokeWidth={2}
                fill="#10B98120"
                dot={{ stroke: '#ddd', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            {shows[1] && (
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#F43F5E"
                strokeWidth={2}
                fill="#F43F5E20"
                dot={{ stroke: '#ddd', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.1)' }}
              animationEasing="ease-in-out"
              animationDuration={200}
              formatter={formatTooltip}
              labelStyle={{ color: '#01dbe5' }}
              contentStyle={{
                background: '#333',
                borderRadius: 8,
                border: 'none',
                boxShadow: '0px 14px 10px 5px rgba(0, 0, 0, 0.2)',
              }}
            />
          </AreaChart>
        ) : (
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis
              dataKey="name"
              fontSize={12}
            />
            <PolarRadiusAxis />
            {shows[0] && (
              <Radar
                dataKey="income"
                stroke="#10B981"
                fill="#10B98180"
                fillOpacity={0.6}
              />
            )}
            {shows[1] && (
              <Radar
                dataKey="expense"
                stroke="#F43F5E"
                fill="#F43F5E80"
                fillOpacity={0.6}
              />
            )}
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{
                background: '#333',
                borderRadius: 8,
                border: 'none',
                boxShadow: '0px 14px 10px 5px rgba(0, 0, 0, 0.2)',
              }}
            />
          </RadarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

export default memo(Chart)
