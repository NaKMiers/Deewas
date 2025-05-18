import CollapseContents from '@/components/landing/CollapseContents'
import ContactForm from '@/components/landing/ContactForm'
import Header from '@/components/landing/Header'
import Slider from '@/components/landing/Slider'
import ParticlesContainer from '@/components/ParticlesContainer'
import { Separator } from '@/components/ui/separator'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import {
  LucideActivity,
  LucideArrowRight,
  LucideBarChart,
  LucideBrain,
  LucideCalendarCheck,
  LucideCalendarDays,
  LucideCrown,
  LucideFlame,
  LucideLockKeyhole,
  LucideMessageSquare,
  LucidePieChart,
  LucideQuote,
  LucideSmartphone,
  LucideSparkles,
  LucideTags,
  LucideWalletCards,
} from 'lucide-react'
import Image from 'next/image'

const nav = ['home', 'screenshots', 'features', 'FAQs', 'reviews', 'download', 'contact']
const previews = [
  {
    image: '/images/previews/home.png',
    desc: 'Home Screen',
  },
  {
    image: '/images/previews/light.png',
    desc: 'Light Mode',
  },
  {
    image: '/images/previews/ai.png',
    desc: 'AI Feature',
  },
  {
    image: '/images/previews/charts.png',
    desc: 'Charts Screen',
  },
  {
    image: '/images/previews/calendar.png',
    desc: 'Calendar Screen',
  },
  {
    image: '/images/previews/budgets.png',
    desc: 'Budgets Screen',
  },
  {
    image: '/images/previews/transactions.png',
    desc: 'Transactions Screen',
  },
]
const features = [
  {
    icon: LucideBrain,
    title: 'AI Assistant',
    desc: 'Use AI to add or edit transactions, set budgets, and personalize your experience.',
  },
  {
    icon: LucideWalletCards,
    title: 'Multiple Wallets',
    desc: 'Manage your cash, bank accounts, and digital wallets in one place.',
  },
  {
    icon: LucideBarChart,
    title: 'Smart Analytics',
    desc: 'Visualize your income, expenses, and savings with interactive charts.',
  },
  {
    icon: LucideTags,
    title: 'Custom Categories',
    desc: 'Create and manage your own spending categories tailored to your lifestyle.',
  },
  {
    icon: LucideCalendarDays,
    title: 'Budget Planner',
    desc: 'Set monthly budgets by category and get alerts when you’re close to limits.',
  },
  {
    icon: LucideFlame,
    title: 'Daily Streaks',
    desc: 'Build healthy financial habits by tracking your streaks for logging expenses, staying under budget, or saving daily.',
  },
  {
    icon: LucideLockKeyhole,
    title: 'Private & Secure',
    desc: 'Your data is encrypted and backed up - only you can access your financial records.',
  },
  {
    icon: LucideCrown,
    title: 'Premium Experience',
    desc: 'Enjoy an ad-free experience with exclusive AI insights and early feature access.',
  },
]
const specialFeatures = [
  {
    subTitle: 'AI Assistant',
    title: 'Smart & Effortless Finance',
    desc: 'Chat with your AI assistant to log expenses, set budgets, or track savings - no typing or navigating needed.',
    image: '/images/features/ai-feature.png',
    subs: [
      {
        icon: LucideMessageSquare,
        title: 'Conversational Input',
        desc: 'Simply type or speak to log transactions, ask for reports, or update your finances.',
      },
      {
        icon: LucideSparkles,
        title: 'Intelligent Suggestions',
        desc: 'Get personalized tips and smart actions based on your spending habits and goals.',
      },
    ],
  },
  {
    subTitle: 'Insights & Reports',
    title: 'Visualize Your Finances',
    desc: 'Understand your spending habits with clear charts and real-time insights.',
    image: '/images/features/chart-feature.png',
    subs: [
      {
        icon: LucidePieChart,
        title: 'Smart Breakdown',
        desc: 'See where your money goes across categories, wallets, and time periods.',
      },
      {
        icon: LucideActivity,
        title: 'Real-Time Tracking',
        desc: 'Monitor your financial health and progress toward goals at a glance.',
      },
    ],
  },
  {
    subTitle: 'Daily Streaks',
    title: 'Build Better Habits',
    desc: 'Stay motivated with streaks that reward you for consistency in tracking your finances.',
    image: '/images/features/streaks-feature.png',
    subs: [
      {
        icon: LucideFlame,
        title: 'Streak Rewards',
        desc: 'Get positive reinforcement by keeping your daily financial tracking streak alive.',
      },
      {
        icon: LucideCalendarCheck,
        title: 'Habit Formation',
        desc: 'Turn mindful spending into a daily habit with streak-based motivation.',
      },
    ],
  },
]
const FAQs = [
  {
    question: 'How does it work?',
    answer:
      'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form.',
  },
  {
    question: 'What is the purpose of this app?',
    answer: 'The phrasal sequence of the is now so that many campaign and benefit',
  },
  {
    question: 'How to use this app?',
    answer:
      'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form.',
  },
  {
    question: 'What is the purpose of this app?',
    answer: 'The phrasal sequence of the is now so that many campaign and benefit',
  },
]
const reviews = [
  {
    image: '/images/avatars/avt1.jpg',
    name: 'Emily Johnson',
    position: 'Freelance Designer',
    text: 'Deewas has completely changed how I manage my freelance income and expenses. The AI assistant is like having a personal accountant in my pocket.',
    rating: 5,
  },
  {
    image: '/images/avatars/avt2.jpg',
    name: 'Michael Smith',
    position: 'Software Engineer',
    text: 'I’ve tried several finance apps, but Deewas is the only one that feels modern and truly helpful. Love the smart suggestions from the AI!',
    rating: 5,
  },
  {
    image: '/images/avatars/avt3.jpg',
    name: 'Nikko Barton',
    position: 'Startup Founder',
    text: 'Managing both business and personal finances was chaotic - until I found Deewas. The budgeting tools and charts make everything so much clearer.',
    rating: 5,
  },
  {
    image: '/images/avatars/avt4.jpg',
    name: 'Jane Doe',
    position: 'Marketing Manager',
    text: 'The app is beautiful and easy to use. I especially love the streaks feature - it keeps me motivated to track my spending daily.',
    rating: 5,
  },
  {
    image: '/images/avatars/avt5.jpg',
    name: 'Sophia Williams',
    position: 'University Student',
    text: 'As a student, budgeting is essential. Deewas helps me stay on track without feeling overwhelmed. It’s simple but powerful.',
    rating: 5,
  },
]

function LandingPage() {
  return (
    <main className="min-h-screen">
      <ParticlesContainer />

      <div id="home" />

      {/* MARK: Header */}
      <Header routes={nav} />

      <Separator className="my-8 h-0" />

      {/* MARK: Hero Banner */}
      <section
        id="home"
        className="container flex flex-col items-center gap-21 px-21/2 md:flex-row md:px-21"
      >
        <div className="relative flex flex-1 flex-col py-8">
          <h6 className="font-body font-semibold uppercase tracking-widest text-sky-500">
            PERSONAL FINANCE
          </h6>
          <h4 className="mb-6 mt-4 text-[40px] font-bold leading-[50px] sm:text-[52px] sm:leading-[72px]">
            Smarter way to manage your money
          </h4>

          <p className="max-w-xl">
            Track income, expenses, savings, and investments - all in one place. Let AI help you gain
            control and build better financial habits.
          </p>

          <div className="absolute right-[20%] top-0 h-14 w-14 animate-spin-slow rounded-xl bg-gradient-to-r from-sky-100 to-sky-500 sm:-top-16 sm:left-8 sm:h-20 sm:w-20" />

          <div className="mt-5 flex gap-2.5">
            <Link
              href="https://www.apple.com/app-store"
              target="_blank"
              className="h-12 overflow-hidden rounded-lg border border-primary shadow-md"
            >
              <Image
                src="/images/appstore-download.png"
                width={200}
                height={100}
                alt="Download Deewas on App Store"
                className="h-full w-full"
              />
            </Link>
            <Link
              href="https://play.google.com/store"
              target="_blank"
              className="h-12 overflow-hidden rounded-lg border border-primary shadow-md"
            >
              <Image
                src="/images/googleplay-download.png"
                width={200}
                height={100}
                alt="Download Deewas on Google Play"
                className="h-full w-full"
              />
            </Link>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center sm:flex-shrink-0">
          <div className="flex w-full max-w-[560px] items-center justify-center">
            <Image
              src="/images/hero-phone.png"
              width={600}
              height={600}
              alt="Deewas"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </section>

      <div id="screenshots" />
      <Separator className="my-16 h-0" />

      {/* MARK: Screenshots */}
      <section className="container px-21/2 md:px-21">
        <div className="text-center">
          <h6 className="font-body font-semibold uppercase tracking-widest text-sky-500">
            App Screenshots
          </h6>
          <h4 className="mt-3 text-3xl font-semibold">Made for real life. Built for you.</h4>
          <p className="mx-auto mt-8 max-w-xl text-muted-foreground">
            Explore the beautiful and user-friendly interface of Deewas. Each screen is designed to
            simplify your financial journey.
          </p>
        </div>

        <Slider className="no-scrollbar -mx-1.5 mt-12">
          {previews.map((preview, index) => (
            <div
              className="flex-shrink-0 basis-1/2 snap-start px-1.5 shadow-md sm:basis-1/3 md:basis-1/4"
              key={index}
            >
              <div className="h-full w-full overflow-hidden rounded-xl">
                <Image
                  src={preview.image}
                  width={600}
                  height={600}
                  alt={preview.desc}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          ))}
        </Slider>
      </section>

      <div id="features" />
      <Separator className="my-20 h-0" />

      {/* MARK: Feature */}
      <section className="container px-21/2 md:px-21">
        <div className="text-center">
          <h6 className="font-body font-semibold uppercase tracking-widest text-sky-500">FEATURES</h6>
          <h4 className="mt-3 text-3xl font-semibold">Discover Powerful Features</h4>
          <p className="mx-auto mt-8 max-w-xl text-muted-foreground">
            Unleash the power of our platform with a multitude of powerful features, empowering you to
            achieve your goals.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-21 md:grid-cols-4">
          {features.map((feature, index) => (
            <div
              className="flex flex-col gap-4 rounded-xl bg-primary/80 p-21 text-secondary shadow-lg"
              key={index}
            >
              <div className="flex aspect-square w-16 items-center justify-center rounded-xl bg-sky-500 text-white shadow-lg">
                <feature.icon size={24} />
              </div>

              <p className="text-xl font-medium">{feature.title}</p>
              <p className="">{feature.desc} </p>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col gap-20">
          {specialFeatures.map((feature, index) => (
            <div
              className="grid grid-cols-12 items-center gap-21"
              key={index}
            >
              <div
                className={cn(
                  'col-span-12 rounded-3xl bg-sky-500/30 px-12 pt-12 shadow-lg md:col-span-5',
                  index % 2 !== 0 && 'md:order-2'
                )}
              >
                <Image
                  src={feature.image}
                  width={380}
                  height={380}
                  alt="Chart Feature"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className={cn('col-span-12 px-21 md:col-span-7', index % 2 !== 0 && 'md:order-1')}>
                <h6 className="font-body font-semibold uppercase tracking-widest text-sky-500">
                  {feature.subTitle}
                </h6>
                <h4 className="mt-3 max-w-sm text-3xl font-semibold"> {feature.title}</h4>
                <p className="mt-6 max-w-xl text-muted-foreground">{feature.desc}</p>
                <div className="mt-6 flex flex-col gap-21">
                  {feature.subs.map((sub, index) => (
                    <div
                      className="trans-300 group flex gap-21/2 rounded-lg border border-primary/10 bg-primary/5 p-21 shadow-lg hover:bg-sky-500 hover:text-primary"
                      key={index}
                    >
                      <sub.icon
                        size={32}
                        className="trans-300 mt-2 flex-shrink-0 text-sky-500 group-hover:text-primary"
                      />
                      <div>
                        <h5 className="trans-300 text-xl font-semibold">{sub.title}</h5>
                        <p className="trans-300 text-muted-foreground group-hover:text-primary">
                          {sub.desc}{' '}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div id="FAQs" />
      <Separator className="my-20 h-0" />

      {/* MARK: FAQs */}
      <section className="container flex flex-col gap-21 px-21/2 md:flex-row md:px-21">
        <div className="flex-1 sm:order-2 md:order-1">
          <h6 className="font-body font-semibold uppercase tracking-widest text-sky-500">FAQs</h6>
          <h4 className="mt-3 max-w-sm text-3xl font-semibold">Have Questions? Look Here</h4>
          <p className="mt-6 max-w-xl text-muted-foreground">
            Unleash the power of our platform with a multitude of powerful features, empowering you to
            achieve your goals.
          </p>

          <CollapseContents
            data={FAQs.map(item => ({ content: item.question, hiddenContent: item.answer }))}
            className="mt-8"
          />
        </div>
        <div className="flex flex-1 items-center justify-center sm:order-1 md:order-2">
          <div className="flex w-full max-w-[450px] items-center justify-center">
            <Image
              src="/images/settings-screen.png"
              width={600}
              height={600}
              alt="Deewas"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </section>

      <div id="reviews" />
      <Separator className="my-20 h-0" />

      {/* MARK: Reviews */}
      <section className="container px-21/2 md:px-21">
        <div className="text-center">
          <h6 className="font-body font-semibold uppercase tracking-widest text-sky-500">Reviews</h6>
          <h4 className="mt-3 text-3xl font-semibold">10k+ Customers Trust Us</h4>
          <p className="mx-auto mt-8 max-w-xl text-muted-foreground">
            Unleash the power of our platform with a multitude of powerful features, empowering you to
            achieve your goals.
          </p>
        </div>

        <Slider className="no-scrollbar mt-12">
          {reviews.map((review, index) => (
            <div
              className="flex-shrink-0 basis-1/2 snap-start px-1.5 sm:basis-1/3"
              key={index}
            >
              <div className="flex flex-col items-center gap-21 rounded-lg border border-primary/10 p-21">
                <LucideQuote
                  size={24}
                  className="text-sky-500"
                />
                <p className="text-center text-muted-foreground">&quot;{review.text}&quot;</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: review.rating }, (_, index) => (
                    <Image
                      src="/icons/star.png"
                      width={16}
                      height={16}
                      alt="star"
                      key={index}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-7 flex flex-col items-center">
                <div className="w-14h-14 aspect-square h-14 overflow-hidden rounded-full shadow-lg">
                  <Image
                    src={review.image}
                    width={100}
                    height={100}
                    alt={review.name}
                  />
                </div>

                <p className="mt-4 font-medium">{review.name}</p>
                <p className="text-xs font-medium text-muted-foreground">{review.position}</p>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      <div id="download" />
      <Separator className="my-20 h-0" />

      {/* MARK: Download */}
      <section className="container grid grid-cols-12 items-center gap-21 px-21/2 md:px-21">
        <div className={cn('rounded-3xl bg-sky-500/30 px-12 pt-12 shadow-lg md:col-span-5')}>
          <Image
            src="/images/features/calendar-feature.png"
            width={380}
            height={380}
            alt="Chart Feature"
            className="h-full w-full object-contain"
          />
        </div>
        <div className={cn('col-span-12 px-21 md:col-span-7')}>
          <h6 className="font-body font-semibold uppercase tracking-widest text-sky-500">MOBILE APPS</h6>
          <h4 className="mt-3 max-w-sm text-3xl font-semibold">Manage Your Money</h4>
          <h4 className="mt-3 max-w-sm text-3xl font-semibold">Right from Your Phone</h4>
          <p className="mt-6 max-w-xl text-muted-foreground">
            Download Deewas on iOS and Android to track expenses, monitor your budget, and chat with your
            AI financial assistant - anytime, anywhere.
          </p>
          <div className="mt-5 flex gap-2.5">
            <Link
              href="https://www.apple.com/app-store"
              target="_blank"
              className="h-12 overflow-hidden rounded-lg border border-primary shadow-md"
            >
              <Image
                src="/images/appstore-download.png"
                width={200}
                height={100}
                alt="Download Deewas on App Store"
                className="h-full w-full"
              />
            </Link>
            <Link
              href="https://play.google.com/store"
              target="_blank"
              className="h-12 overflow-hidden rounded-lg border border-primary shadow-md"
            >
              <Image
                src="/images/googleplay-download.png"
                width={200}
                height={100}
                alt="Download Deewas on Google Play"
                className="h-full w-full"
              />
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-2">
            <LucideSmartphone size={36} />
            <div>
              <p>Install app now on your cellphones</p>
              <p className="trans-20 flex items-center gap-2 hover:text-sky-500">
                Install Now <LucideArrowRight size={16} />
              </p>
            </div>
          </div>
        </div>
      </section>

      <div id="contact" />
      <Separator className="my-20 h-0" />

      {/* MARK: Contact */}
      <section className="container grid grid-cols-12 gap-y-21 px-21/2 md:px-21">
        <div className="col-span-12 flex-1 md:col-span-6">
          <Image
            src="/images/contact-us.png"
            width={400}
            height={400}
            className="h-full w-full object-contain"
            alt="Contact Us"
          />
        </div>
        <div className="col-span-12 flex flex-1 items-center justify-center md:col-span-6 md:p-12">
          <ContactForm
            subTitle="CONTACT US"
            title="Get in touch !"
            className="pb-8"
          />
        </div>
      </section>

      <Separator className="my-48 h-0" />

      {/* MARK: Footer */}
      <footer>
        <div className="mx-auto max-w-7xl px-4 py-6 text-center sm:px-6 lg:px-8">
          <p className="text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Deewas. All rights reserved. | Contact us at{' '}
            <a
              href="mailto:deewas.now@gmail.com"
              className="text-sky-500 hover:underline"
            >
              deewas.now@gmail.com
            </a>
          </p>
        </div>
      </footer>
    </main>
  )
}

export default LandingPage
