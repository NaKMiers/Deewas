'use client'

import { useAppDispatch } from '@/hooks/reduxHook'
import { handleQuery, searchParamsToSingleFieldObject } from '@/lib/query'
import { setPageLoading } from '@/lib/reducers/loadReducer'
import { IReport } from '@/models/ReportModel'
import { getAllReportsApi } from '@/requests'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

type Question = {
  question: string
  answers: [string, number][]
}

function ReportPage() {
  // hooks
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const router = useRouter()
  const params = useSearchParams()
  const searchParams: any = useMemo(() => searchParamsToSingleFieldObject(params), [params])

  // states
  const [reports, setReports] = useState<IReport[]>([])
  const [amount, setAmount] = useState<number>(0)
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  // values
  const itemPerPage = 9

  // form
  const defaultValues = useMemo<FieldValues>(
    () => ({
      search: '',
      sort: 'updatedAt|-1',
      authType: 'all',
      role: 'all',
      isDeleted: 'all',
    }),
    []
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    reset,
    control,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues,
  })

  // MARK: Get Data
  // get all reports
  useEffect(() => {
    // get all reports
    const getAllReports = async () => {
      const query = handleQuery(searchParams)

      // start page loading
      dispatch(setPageLoading(true))

      try {
        const { reports, amount } = await getAllReportsApi(query)
        const results: any[] = reports.map((r: any) => r.results).flat()

        const groups: { [key: string]: Question } = {}

        for (const result of results) {
          if (!groups[result.question]) {
            const sameQuestionAnswers = results
              .filter(r => r.question === result.question)
              .map(r => r.answer)
              .flat()

            const counts: Record<string, number> = {}
            sameQuestionAnswers.forEach(ans => {
              counts[ans] = (counts[ans] || 0) + 1
            })

            const summarizedAnswers: [string, number][] = Object.entries(counts)

            groups[result.question] = {
              question: result.question,
              answers: summarizedAnswers,
            }
          }
        }

        // set to states
        setReports(reports)
        setAmount(amount)
        setQuestions(Object.values(groups))

        // sync search params with states
        setValue('search', searchParams?.search || getValues('search'))
        setValue('sort', searchParams?.sort || getValues('sort'))
        setValue('authType', searchParams?.authType || getValues('authType'))
        setValue('role', searchParams?.role || getValues('role'))
        setValue('isDeleted', searchParams?.isDeleted || getValues('isDeleted'))
      } catch (err: any) {
        console.log(err)
      } finally {
        // stop page loading
        dispatch(setPageLoading(false))
      }
    }
    getAllReports()
  }, [dispatch, searchParams, setValue, getValues])

  // handle select all reports
  const handleSelectAllReports = useCallback(() => {
    setSelectedReports(selectedReports.length > 0 ? [] : reports.map(r => r._id))
  }, [reports, selectedReports.length])

  // handle optimize filter
  const handleOptimizeFilter: SubmitHandler<FieldValues> = useCallback(
    data => {
      // reset page
      if (searchParams?.page) {
        delete searchParams.page
      }

      // loop through data to prevent filter default
      for (let key in data) {
        if (data[key] === defaultValues[key]) {
          if (!searchParams?.[key]) {
            delete data[key]
          } else {
            data[key] = ''
          }
        }
      }

      return {
        ...data,
      }
    },
    [searchParams, defaultValues]
  )

  // handle submit filter
  const handleFilter: SubmitHandler<FieldValues> = useCallback(
    async data => {
      const params: any = handleOptimizeFilter(data)

      // handle query
      const query = handleQuery({
        ...searchParams,
        ...params,
      })

      // push to router
      router.push(pathname + query)
    },
    [handleOptimizeFilter, router, searchParams, pathname]
  )

  // handle reset filter
  const handleResetFilter = useCallback(() => {
    reset()
    router.push(pathname)
  }, [reset, router, pathname])

  // keyboard event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + A (Select All)
      if (e.altKey && e.key === 'a') {
        e.preventDefault()
        handleSelectAllReports()
      }
    }

    // Add the event listener
    window.addEventListener('keydown', handleKeyDown)

    // Remove the event listener on cleanup
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleFilter, handleResetFilter, handleSelectAllReports, handleSubmit])

  return (
    <div className="w-full p-21">
      {/* MARK: Amount */}
      <div className="p-3 text-right text-sm font-semibold text-white">
        {Math.min(itemPerPage * +(searchParams?.page || 1), amount)}/{amount} report{amount !== 1 && 's'}
      </div>

      {/* MARK: Chart */}

      {/* MARK: MAIN LIST */}
      <div className="grid grid-cols-1 gap-21 md:grid-cols-2">
        {questions.map(({ question, answers }) => {
          const pieData = answers
            .map(([answerText, amount]) => ({
              name: answerText,
              value: amount,
            }))
            .filter(item => item.value > 0)

          return (
            <div
              key={question}
              className="rounded border p-4 shadow"
            >
              <h2 className="mb-2 text-lg font-bold">{question}</h2>
              <ul className="space-y-1">
                {answers.map(([answerText, amount]) => (
                  <li
                    key={answerText}
                    className="flex justify-between"
                  >
                    <span>{answerText}</span>
                    <span className="text-sm font-semibold text-gray-500">({amount})</span>
                  </li>
                ))}
              </ul>

              <ResponsiveContainer
                width="100%"
                height={380}
              >
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((_: any, index) => (
                      <Cell
                        key={index}
                        fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    animationEasing="ease-in-out"
                    animationDuration={200}
                    labelStyle={{ color: '#01dbe5' }}
                    contentStyle={{
                      fontSize: 13,
                      borderRadius: 8,
                      border: 'none',
                      boxShadow: '0px 5px 5px 2px rgba(0, 0, 0, 0.2)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ReportPage
