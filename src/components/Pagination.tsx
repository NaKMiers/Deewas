'use client'

import { handleQuery } from '@/lib/query'
import { LucideChevronLeft, LucideChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { memo, useCallback, useEffect } from 'react'

interface PaginationProps {
  searchParams: { [key: string]: string[] | string } | undefined
  amount: number
  itemsPerPage: number
  className?: string
}

function Pagination({
  searchParams = {},
  amount = 0,
  itemsPerPage = 9, // default item/page
  className = '',
}: PaginationProps) {
  // hooks
  const pathname = usePathname()
  const router = useRouter()
  const queryParams = useSearchParams()
  const page = queryParams.get('page')

  // values
  const pageAmount = Math.ceil(amount / itemsPerPage) // calculate page amount
  const currentPage = page ? +page : 1

  // set page link
  const getPageLink = useCallback(
    (value: number) => {
      // get page from searchParams
      const params = { ...searchParams }
      if (params.page) {
        delete params.page
      }
      params.page = [value.toString()]

      return pathname + handleQuery(params)
    },
    [searchParams, pathname]
  )

  // keyboard event
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // left arrow
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        router.push(getPageLink(currentPage - 1))
      }

      // right arrow
      if (e.key === 'ArrowRight' && currentPage < pageAmount) {
        router.push(getPageLink(currentPage + 1))
      }
    }

    window.addEventListener('keydown', handleKeydown)

    return () => {
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [currentPage, pageAmount, router, getPageLink])

  return (
    pageAmount > 0 && (
      <div
        className={`mx-auto flex w-full max-w-[491px] justify-center gap-2 font-semibold ${className}`}
      >
        {/* MARK: Prev */}
        {currentPage != 1 && (
          <Link
            href={getPageLink(currentPage <= 1 ? 1 : currentPage - 1)}
            className="trans-200 rounded-lg border-2 border-white px-2 py-[6px] hover:bg-secondary hover:text-white"
            title={`👈 Trang ${currentPage <= 1 ? 1 : currentPage - 1}`}
          >
            <LucideChevronLeft size={20} />
          </Link>
        )}

        {/* MARK: 1 ... n */}
        <div className="no-scrollbar flex gap-2 overflow-x-scroll">
          {Array.from({ length: pageAmount }).map((_, index) => (
            <Link
              href={getPageLink(index + 1)}
              className={`trans-200 text-dark rounded-lg border-2 border-white px-4 py-[6px] hover:bg-secondary hover:text-white ${
                currentPage === index + 1 ? 'border-primary bg-secondary' : ''
              }`}
              key={index}
            >
              {index + 1}
            </Link>
          ))}
        </div>

        {/* MARK: Next */}
        {currentPage != pageAmount && (
          <Link
            href={getPageLink(currentPage >= pageAmount ? pageAmount : currentPage + 1)}
            className="trans-200 rounded-lg border-2 border-white px-2 py-[6px] hover:bg-secondary hover:text-white"
            title={`👉 Trang ${currentPage >= pageAmount ? pageAmount : currentPage + 1}`}
          >
            <LucideChevronRight size={20} />
          </Link>
        )}
      </div>
    )
  )
}

export default memo(Pagination)
