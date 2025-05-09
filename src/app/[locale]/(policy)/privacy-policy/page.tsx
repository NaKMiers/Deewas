import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Deewas',
  description: 'Privacy Policy for the Deewas mobile application.',
}

const sections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'information-collection', title: 'Information Collection and Use' },
  { id: 'third-party', title: 'Third Party Access' },
  { id: 'opt-out', title: 'Opt-Out Rights' },
  { id: 'data-retention', title: 'Data Retention Policy' },
  { id: 'children', title: 'Children' },
  { id: 'security', title: 'Security' },
  { id: 'changes', title: 'Changes' },
  { id: 'consent', title: 'Your Consent' },
  { id: 'contact', title: 'Contact Us' },
]

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-secondary">
      <div className="mx-auto mt-12 flex max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <div className="fixed left-8 top-24 hidden w-72 lg:block">
          <h3 className="mb-4 text-lg font-semibold">Table of Contents</h3>
          <nav className="space-y-2">
            {sections.map(section => (
              <Button
                key={section.id}
                variant="ghost"
                className="w-full justify-start text-left"
                asChild
              >
                <a href={`#${section.id}`}>{section.title}</a>
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex-1 lg:ml-72">
          <Card className="bg-white text-black shadow-xl transition-shadow duration-300 hover:shadow-2xl">
            <CardHeader>
              <CardTitle className="text-center text-4xl font-bold">Privacy Policy</CardTitle>
              <p className="text-center text-sm">Effective as of April 12, 2025</p>
            </CardHeader>
            <CardContent className="space-y-10">
              <section id="introduction">
                <h2 className="mb-4 text-2xl font-semibold">Introduction</h2>
                <p className="">
                  This privacy policy applies to the Deewas app (hereby referred to as
                  &quot;Application&quot;) for mobile devices that was created by Anh Khoa Nguyen (hereby
                  referred to as &quot;Service Provider&quot;) as a Free service. This service is
                  intended for use &quot;AS IS&quot;.
                </p>
              </section>

              <section id="information-collection">
                <h2 className="mb-4 text-2xl font-semibold">Information Collection and Use</h2>
                <p className="">
                  The Application collects information when you download and use it. This information may
                  include:
                </p>
                <ul className="mt-2 list-disc pl-6">
                  <li>
                    {' '}
                    Information you provide during login, such as your email address, username, first and
                    last name
                  </li>
                  <li>
                    Public profile information retrieved from third-party services (e.g., Google, Apple)
                    if you choose to log in using these services
                  </li>
                  <li>The operating system you use on your mobile device</li>
                </ul>
                <p className="mt-4">
                  The Application does not gather information about the location of your mobile device.
                </p>
                <p className="mt-4">
                  The Service Provider may use the information you provided to contact you from time to
                  time to provide you with important information, required notices, and marketing
                  promotions.
                </p>
                <p className="mt-4">
                  For a better experience, while using the Application, the Service Provider may require
                  you to provide us with certain personally identifiable information, including but not
                  limited to email, name, birthday. The information that the Service Provider requests
                  will be retained by them and used as described in this privacy policy.
                </p>
              </section>

              <section id="third-party">
                <h2 className="mb-4 text-2xl font-semibold">Third Party Access</h2>
                <p className="">
                  Only aggregated, anonymized data is periodically transmitted to external services to
                  aid the Service Provider in improving the Application and their service. The Service
                  Provider may share your information with third parties in the ways that are described
                  in this privacy statement.
                </p>
                <p className="mt-4">
                  Please note that the Application utilizes third-party services that have their own
                  Privacy Policy about handling data. Below are the links to the Privacy Policy of the
                  third-party service providers used by the Application:
                </p>
                <ul className="mt-2 list-disc pl-6">
                  <li>
                    <a
                      href="https://policies.google.com/privacy"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Google Play Services
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.facebook.com/about/privacy"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Facebook
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.apple.com/legal/privacy/"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Apple Privacy Policy
                    </a>
                  </li>
                </ul>
                <p className="mt-4">
                  The Service Provider may disclose User Provided and Automatically Collected
                  Information:
                </p>
                <ul className="mt-2 list-disc pl-6">
                  <li>
                    as required by law, such as to comply with a subpoena, or similar legal process;
                  </li>
                  <li>
                    when they believe in good faith that disclosure is necessary to protect their rights,
                    protect your safety or the safety of others, investigate fraud, or respond to a
                    government request;
                  </li>
                  <li>
                    with their trusted services providers who work on their behalf, do not have an
                    independent use of the information we disclose to them, and have agreed to adhere to
                    the rules set forth in this privacy statement.
                  </li>
                </ul>
              </section>

              <section id="opt-out">
                <h2 className="mb-4 text-2xl font-semibold">Opt-Out Rights</h2>
                <p className="">
                  You can stop all collection of information by the Application easily by uninstalling
                  it. You may use the standard uninstall processes as may be available as part of your
                  mobile device or via the mobile application marketplace or network.
                </p>
              </section>

              <section id="data-retention">
                <h2 className="mb-4 text-2xl font-semibold">Data Retention Policy</h2>
                <p className="">
                  The Service Provider will retain User Provided data for as long as you use the
                  Application and for a reasonable time thereafter. If you’d like them to delete User
                  Provided Data that you have provided via the Application, please contact them at{' '}
                  <a
                    href="mailto:deewas.now@gmail.com"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    deewas.now@gmail.com
                  </a>{' '}
                  and they will respond in a reasonable time.
                </p>
              </section>

              <section id="children">
                <h2 className="mb-4 text-2xl font-semibold">Children</h2>
                <p className="">
                  The Service Provider does not use the Application to knowingly solicit data from or
                  market to children under the age of 13.
                </p>
                <p className="mt-4">
                  The Application does not address anyone under the age of 13. The Service Provider does
                  not knowingly collect personally identifiable information from children under 13 years
                  of age. In the case the Service Provider discovers that a child under 13 has provided
                  personal information, the Service Provider will immediately delete this from their
                  servers. If you are a parent or guardian and you are aware that your child has provided
                  us with personal information, please contact the Service Provider (
                  <a
                    href="mailto:deewas.now@gmail.com"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    deewas.now@gmail.com
                  </a>
                  ) so that they will be able to take the necessary actions.
                </p>
              </section>

              <section id="security">
                <h2 className="mb-4 text-2xl font-semibold">Security</h2>
                <p className="">
                  The Service Provider is concerned about safeguarding the confidentiality of your
                  information. The Service Provider provides physical, electronic, and procedural
                  safeguards to protect information the Service Provider processes and maintains.
                </p>
              </section>

              <section id="changes">
                <h2 className="mb-4 text-2xl font-semibold">Changes</h2>
                <p className="">
                  This Privacy Policy may be updated from time to time for any reason. The Service
                  Provider will notify you of any changes to the Privacy Policy by updating this page
                  with the new Privacy Policy. You are advised to consult this Privacy Policy regularly
                  for any changes, as continued use is deemed approval of all changes.
                </p>
              </section>

              <section id="consent">
                <h2 className="mb-4 text-2xl font-semibold">Your Consent</h2>
                <p className="">
                  By using the Application, you are consenting to the processing of your information as
                  set forth in this Privacy Policy now and as amended by us.
                </p>
              </section>

              <section id="contact">
                <h2 className="mb-4 text-2xl font-semibold">Contact Us</h2>
                <p className="">
                  If you have any questions regarding privacy while using the Application, or have
                  questions about the practices, please contact the Service Provider via email at{' '}
                  <a
                    href="mailto:deewas.now@gmail.com"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    deewas.now@gmail.com
                  </a>
                  .
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
