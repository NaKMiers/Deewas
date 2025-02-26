import Chart from './Chart'

const userSettings = {
  currency: 'USD',
}

const exchangeRate = 1

function History() {
  return (
    <div>
      <div className="px-21/2 md:px-21 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">History</h2>
      </div>

      <Chart
        shows={[true, true]}
        maxKey={'income'}
        chart={'Line'}
        data={[]}
        userSettings={userSettings}
        exchangeRate={exchangeRate}
        // className="-ml-21 pr-21/2"
      />
    </div>
  )
}

export default History

// interface SingleSelectionProps {
//   trigger: ReactNode
//   list: any[]
//   selected: any
//   onChange: (value: any) => void
// }

// function SingleSelection({ trigger, list, selected, onChange }: SingleSelectionProps) {
//   // states
//   const [open, setOpen] = useState<boolean>(false)

//   return (
//     <div className="relative">
//       <div onClick={() => setOpen(!open)}>{trigger}</div>

//       {/* overlay */}
//       {open && (
//         <div
//           className="fixed left-0 top-0 z-10 h-screen w-screen"
//           onClick={() => setOpen(false)}
//         />
//       )}

//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ opacity: 0, y: 50 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 50 }}
//             transition={{ duration: 0.3, ease: 'easeInOut' }}
//             className="absolute left-0 top-[calc(100%+10.5px)] z-10 flex max-h-[400px] max-w-[calc(100vw-2*21px)] flex-col gap-0.5 overflow-y-auto rounded-md bg-neutral-800 shadow-md"
//             onClick={() => setOpen(false)}
//           >
//             {list.map((type, index) => (
//               <button
//                 className={`trans-200 trans-200 font-body px-3 py-1 text-left text-xs font-semibold tracking-wider hover:bg-slate-700 ${
//                   selected === type ? 'border-l-2 border-primary pl-2' : ''
//                 }`}
//                 onClick={() => onChange(type)}
//                 key={index}
//               >
//                 <p className="text-nowrap">{type}</p>
//               </button>
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   )
// }

// interface MultiSelectionProps {
//   trigger: ReactNode
//   list: any[]
//   selected: any[]
//   onChange: (value: any) => void
// }

// export function MultipleSelection({ trigger, list, selected, onChange }: MultiSelectionProps) {
//   // states
//   const [open, setOpen] = useState<boolean>(false)
//   const isObjectItem = typeof list[0] === 'object'

//   return (
//     <div className="relative">
//       <div onClick={() => setOpen(!open)}>{trigger}</div>

//       {open && (
//         <div
//           className="fixed left-0 top-0 h-screen w-screen"
//           onClick={() => setOpen(false)}
//         />
//       )}

//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ opacity: 0, y: 50 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 50 }}
//             transition={{ duration: 0.3, ease: 'easeInOut' }}
//             className="absolute left-0 top-[calc(100%+10.5px)] z-10 flex max-h-[400px] max-w-[calc(100vw-2*21px)] flex-col gap-0.5 overflow-y-auto rounded-md bg-neutral-800 shadow-md"
//           >
//             <button
//               className={`trans-200 trans-200 font-body text-light px-3 py-1 text-left text-xs font-semibold tracking-wider ${
//                 selected.length === list.length ? 'border-l-2 border-primary pl-2' : ''
//               }`}
//               onClick={selected.length === list.length ? () => onChange([]) : () => onChange(list)}
//             >
//               <span className="text-nowrap">All</span>
//             </button>
//             {list.map((item, index) => (
//               <button
//                 className={`trans-200 trans-200 font-body text-light bg-neutral-800 px-3 py-1 text-left text-xs font-semibold tracking-wider ${
//                   (
//                     isObjectItem
//                       ? selected.some((ele: any) => ele._id.toString() === item._id.toString())
//                       : selected.includes(item)
//                   )
//                     ? 'border-l-2 border-primary pl-2'
//                     : ''
//                 }`}
//                 onClick={() => {
//                   if (isObjectItem) {
//                     if (selected.some((ele: any) => ele._id.toString() === item._id.toString())) {
//                       return onChange(selected.filter(ele => ele._id.toString() !== item._id.toString()))
//                     } else {
//                       return onChange([...selected, item])
//                     }
//                   } else {
//                     if (selected.includes(item)) {
//                       return onChange(selected.filter(ele => ele !== item))
//                     } else {
//                       return onChange([...selected, item])
//                     }
//                   }
//                 }}
//                 key={index}
//               >
//                 <p className="text-nowrap capitalize">{isObjectItem ? item.name : item}</p>
//               </button>
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   )
// }
