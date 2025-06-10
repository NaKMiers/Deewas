import ar from '../../messages/ar.json'
import bn from '../../messages/bn.json'
import de from '../../messages/de.json'
import en from '../../messages/en.json'
import es from '../../messages/es.json'
import fr from '../../messages/fr.json'
import gu from '../../messages/gu.json'
import hi from '../../messages/hi.json'
import id from '../../messages/id.json'
import it from '../../messages/it.json'
import ja from '../../messages/ja.json'
import kn from '../../messages/kn.json'
import ko from '../../messages/ko.json'
import ml from '../../messages/ml.json'
import ms from '../../messages/ms.json'
import nl from '../../messages/nl.json'
import pt from '../../messages/pt.json'
import ru from '../../messages/ru.json'
import ta from '../../messages/ta.json'
import te from '../../messages/te.json'
import th from '../../messages/th.json'
import tr from '../../messages/tr.json'
import ur from '../../messages/ur.json'
import vi from '../../messages/vi.json'
import zhHant from '../../messages/zh-Hant.json'
import zh from '../../messages/zh.json'

export const initCategories = {
  income: [
    {
      name: 'Salary',
      icon: '💰',
      type: 'income',
    },
    {
      name: 'Business',
      icon: '🏢',
      type: 'income',
    },
    {
      name: 'Gift',
      icon: '🎁',
      type: 'income',
    },
    {
      name: 'Refund',
      icon: '🔄',
      type: 'income',
    },
    {
      name: 'Interest',
      icon: '📈',
      type: 'income',
    },
    {
      name: 'Other Income',
      icon: '💲',
      type: 'income',
    },
    {
      name: 'Uncategorized Income',
      icon: '🔖',
      type: 'income',
      deletable: false,
    },
  ],
  expense: [
    {
      name: 'Food',
      icon: '🍔',
      type: 'expense',
    },
    {
      name: 'Rent',
      icon: '🏠',
      type: 'expense',
    },
    {
      name: 'Shopping',
      icon: '🛍️',
      type: 'expense',
    },
    {
      name: 'Pets',
      icon: '🐶',
      type: 'expense',
    },
    {
      name: 'Transport',
      icon: '🚗',
      type: 'expense',
    },
    {
      name: 'Health',
      icon: '🏥',
      type: 'expense',
    },
    {
      name: 'Entertainment',
      icon: '🎥',
      type: 'expense',
    },
    {
      name: 'Education',
      icon: '🎓',
      type: 'expense',
    },
    {
      name: 'Gift',
      icon: '🎁',
      type: 'expense',
    },
    {
      name: 'Investment',
      icon: '📈',
      type: 'expense',
    },
    {
      name: 'Insurance',
      icon: '🛡️',
      type: 'expense',
    },
    {
      name: 'Bill',
      icon: '📜',
      type: 'expense',
    },
    {
      name: 'Tax',
      icon: '🏦',
      type: 'expense',
    },
    {
      name: 'Transfer',
      icon: '🔄',
      type: 'expense',
    },
    {
      name: 'Other Expense',
      icon: '💲',
      type: 'expense',
    },
    {
      name: 'Uncategorized Expense',
      icon: '🔖',
      type: 'expense',
      deletable: false,
    },
  ],
  saving: [
    {
      name: 'Emergency Fund',
      icon: '🚨',
      type: 'saving',
    },
    {
      name: 'Retirement Fund',
      icon: '🧓',
      type: 'saving',
    },
    {
      name: 'Vacation Fund',
      icon: '🏖️',
      type: 'saving',
    },
    {
      name: 'Education Fund',
      icon: '🎓',
      type: 'saving',
    },
    {
      name: 'Investment Fund',
      icon: '📈',
      type: 'saving',
    },
    {
      name: 'Other Saving',
      icon: '💲',
      type: 'saving',
    },
    {
      name: 'Uncategorized Saving',
      icon: '🔖',
      type: 'saving',
      deletable: false,
    },
  ],
  invest: [
    {
      name: 'Stock',
      icon: '📈',
      type: 'invest',
    },
    {
      name: 'Crypto',
      icon: '💹',
      type: 'invest',
    },
    {
      name: 'Real Estate',
      icon: '🏠',
      type: 'invest',
    },
    {
      name: 'Gold',
      icon: '🥇',
      type: 'invest',
    },
    {
      name: 'Other Investment',
      icon: '📈',
      type: 'invest',
    },
    {
      name: 'Uncategorized Investment',
      icon: '🔖',
      type: 'invest',
      deletable: false,
    },
  ],
}

const messagesByLocale: any = {
  ar,
  bn,
  de,
  en,
  es,
  fr,
  gu,
  hi,
  id,
  it,
  ja,
  kn,
  ko,
  ml,
  ms,
  nl,
  pt,
  ru,
  ta,
  te,
  th,
  tr,
  ur,
  vi,
  'zh-Hant': zhHant,
  zh,
}

// default value if locale is null
export const getMessagesByLocale = (locale: string = 'en') => {
  const messages = messagesByLocale[locale]

  // if locale is not found, return en
  if (!messages) {
    return messagesByLocale.en
  }

  return messages
}
