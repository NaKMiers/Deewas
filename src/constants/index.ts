import momentTZ from 'moment-timezone'
import { FaTicketAlt } from 'react-icons/fa'
import { FaBoltLightning, FaCubes, FaGift, FaListCheck, FaTags, FaUser } from 'react-icons/fa6'
import { MdCategory, MdSpaceDashboard } from 'react-icons/md'
import { RiBillFill } from 'react-icons/ri'

// MARK: Admin Links
export const adminLinks = [
  {
    title: 'Dashboard',
    Icon: MdSpaceDashboard,
    links: [
      {
        title: 'Dashboard',
        href: '/admin',
      },
    ],
  },
  {
    title: 'Order',
    Icon: RiBillFill,
    links: [
      {
        title: 'All Orders',
        href: '/admin/order/all',
      },
    ],
  },
  {
    title: 'Account',
    Icon: FaGift,
    links: [
      {
        title: 'All Accounts',
        href: '/admin/account/all',
      },
      {
        title: 'Add Account',
        href: '/admin/account/add',
      },
    ],
  },
  {
    title: 'User',
    Icon: FaUser,
    links: [
      {
        title: 'All Users',
        href: '/admin/user/all',
      },
    ],
  },
  {
    title: 'Summary',
    Icon: FaListCheck,
    links: [
      {
        title: 'All Summaries',
        href: '/admin/summary/all',
      },
    ],
  },
  {
    title: 'Product',
    Icon: FaCubes,
    links: [
      {
        title: 'All Products',
        href: '/admin/product/all',
      },
      {
        title: 'Add Product',
        href: '/admin/product/add',
      },
    ],
  },
  {
    title: 'Tag',
    Icon: FaTags,
    links: [
      {
        title: 'All Tags',
        href: '/admin/tag/all',
      },
      {
        title: 'Add Tag',
        href: '/admin/tag/add',
      },
    ],
  },
  {
    title: 'Category',
    Icon: MdCategory,
    links: [
      {
        title: 'All Categories',
        href: '/admin/category/all',
      },
      {
        title: 'Add Category',
        href: '/admin/category/add',
      },
    ],
  },
  {
    title: 'Voucher',
    Icon: FaTicketAlt,
    links: [
      {
        title: 'All Vouchers',
        href: '/admin/voucher/all',
      },
      {
        title: 'Add Voucher',
        href: '/admin/voucher/add',
      },
    ],
  },
  {
    title: 'Flash Sale',
    Icon: FaBoltLightning,
    links: [
      {
        title: 'All Flash Sales',
        href: '/admin/flash-sale/all',
      },
      {
        title: 'Add Flash Sale',
        href: '/admin/flash-sale/add',
      },
    ],
  },
]

// MARK: Admin List
export const admins = {
  KHOA: {
    momo: {
      account: process.env.NEXT_PUBLIC_ADMIN_PHONE!,
      receiver: process.env.NEXT_PUBLIC_ADMIN_NAME!,
      link: process.env.NEXT_PUBLIC_MOMO_LINK!,
      image: '/images/momo-qr.jpg',
    },
    banking: {
      name: process.env.NEXT_PUBLIC_BANK_NAME!,
      account: process.env.NEXT_PUBLIC_BANK_ACCOUNT!,
      receiver: process.env.NEXT_PUBLIC_ADMIN_NAME!,
      image: '/images/banking-qr.jpg',
    },
    zalo: process.env.NEXT_PUBLIC_ZALO!,
    messenger: process.env.NEXT_PUBLIC_MESSENGER!,
  },
  TRAM: {
    momo: {
      account: process.env.NEXT_PUBLIC_ADMIN_PHONE_2!,
      receiver: process.env.NEXT_PUBLIC_ADMIN_NAME_2!,
      link: process.env.NEXT_PUBLIC_MOMO_LINK_2!,
      image: '/images/momo-qr-2.jpg',
    },
    banking: {
      name: process.env.NEXT_PUBLIC_BANK_NAME_2!,
      account: process.env.NEXT_PUBLIC_BANK_ACCOUNT_2!,
      receiver: process.env.NEXT_PUBLIC_ADMIN_NAME_2!,
      image: '/images/banking-qr-2.jpg',
    },
    zalo: process.env.NEXT_PUBLIC_ZALO_2!,
    messenger: process.env.NEXT_PUBLIC_MESSENGER!,
  },
}

// MARK: Choose Me
export const chooseMeList = [
  {
    title: 'Đa dạng sản phẩm',
    image: '/images/choose-me-1.jpg',
  },
  {
    title: 'Rẻ nhất thị trường',
    image: '/images/choose-me-2.jpg',
  },
  {
    title: 'Thanh toán lập tức',
    image: '/images/choose-me-3.jpg',
  },
  {
    title: 'Bảo hành uy tín',
    image: '/images/choose-me-4.jpg',
  },
]

// MARK: Regular Expressions
export const EXTRACT_EMAIL_REGEX = /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g

// MARK: Date Range Options
export const getRangeOptions = () => [
  {
    label: 'Today',
    range: [
      {
        startDate: momentTZ().toDate(),
        endDate: momentTZ().toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Yesterday',
    range: [
      {
        startDate: momentTZ().subtract(1, 'days').toDate(),
        endDate: momentTZ().subtract(1, 'days').toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Last 7 days',
    range: [
      {
        startDate: momentTZ().subtract(7, 'days').toDate(),
        endDate: momentTZ().subtract(1, 'days').toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Last 30 days',
    range: [
      {
        startDate: momentTZ().subtract(30, 'days').toDate(),
        endDate: momentTZ().subtract(1, 'days').toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Last 90 days',
    range: [
      {
        startDate: momentTZ().subtract(90, 'days').toDate(),
        endDate: momentTZ().subtract(1, 'days').toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Last 365 days',
    range: [
      {
        startDate: momentTZ().subtract(365, 'days').toDate(),
        endDate: momentTZ().subtract(1, 'days').toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'This month',
    range: [
      {
        startDate: momentTZ().startOf('month').toDate(),
        endDate: momentTZ().endOf('month').toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Last month',
    range: [
      {
        startDate: momentTZ().subtract(1, 'month').startOf('month').toDate(),
        endDate: momentTZ().subtract(1, 'month').endOf('month').toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'This year',
    range: [
      {
        startDate: momentTZ().startOf('year').toDate(),
        endDate: momentTZ().endOf('year').toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Last year',
    range: [
      {
        startDate: momentTZ().subtract(1, 'year').startOf('year').toDate(),
        endDate: momentTZ().subtract(1, 'year').endOf('year').toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Week to date',
    range: [
      {
        startDate: momentTZ().startOf('isoWeek').toDate(),
        endDate: momentTZ().toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Month to date',
    range: [
      {
        startDate: momentTZ().startOf('month').toDate(),
        endDate: momentTZ().toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'Year to date',
    range: [
      {
        startDate: momentTZ().startOf('year').toDate(),
        endDate: momentTZ().toDate(),
        key: 'selection',
      },
    ],
  },
  {
    label: 'All time',
    range: [
      {
        startDate: momentTZ('2023-09-14').toDate(),
        endDate: momentTZ().toDate(),
        key: 'selection',
      },
    ],
  },
]
