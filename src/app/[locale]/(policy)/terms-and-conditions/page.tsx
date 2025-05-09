import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Deewas',
  description: 'Terms and Conditions for the Deewas mobile application.',
}

const sections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'usage', title: 'Usage Agreement' },
  { id: 'modifications', title: 'Modifications and Charges' },
  { id: 'data-security', title: 'Data and Device Security' },
  { id: 'third-party', title: 'Third Party Services' },
  { id: 'responsibility', title: 'Service Provider Responsibility' },
  { id: 'internet', title: 'Internet and Data Charges' },
  { id: 'updates', title: 'Application Updates and Termination' },
  { id: 'changes', title: 'Changes to These Terms' },
  { id: 'contact', title: 'Contact Us' },
]

export default function TermsAndConditions() {
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
              <CardTitle className="text-center text-4xl font-bold">Terms & Conditions</CardTitle>
              <p className="text-center text-sm">Effective as of April 12, 2025</p>
            </CardHeader>
            <CardContent className="space-y-10">
              <section id="introduction">
                <h2 className="mb-4 text-2xl font-semibold">Introduction</h2>
                <p className="">
                  These terms and conditions apply to the Deewas app (hereby referred to as
                  &quot;Application&quot;) for mobile devices that was created by Anh Khoa Nguyen (hereby
                  referred to as `&quot;Service Provider`&quot;) as a Free service.
                </p>
              </section>

              <section id="usage">
                <h2 className="mb-4 text-2xl font-semibold">Usage Agreement</h2>
                <p className="">
                  Upon downloading or utilizing the Application, you are automatically agreeing to the
                  following terms. It is strongly advised that you thoroughly read and understand these
                  terms prior to using the Application. Unauthorized copying, modification of the
                  Application, any part of the Application, or our trademarks is strictly prohibited. Any
                  attempts to extract the source code of the Application, translate the Application into
                  other languages, or create derivative versions are not permitted. All trademarks,
                  copyrights, database rights, and other intellectual property rights related to the
                  Application remain the property of the Service Provider.
                </p>
              </section>

              <section id="modifications">
                <h2 className="mb-4 text-2xl font-semibold">Modifications and Charges</h2>
                <p className="">
                  The Service Provider is dedicated to ensuring that the Application is as beneficial and
                  efficient as possible. As such, they reserve the right to modify the Application or
                  charge for their services at any time and for any reason. The Service Provider assures
                  you that any charges for the Application or its services will be clearly communicated
                  to you.
                </p>
              </section>

              <section id="data-security">
                <h2 className="mb-4 text-2xl font-semibold">Data and Device Security</h2>
                <p className="">
                  The Application stores and processes personal data that you have provided to the
                  Service Provider in order to provide the Service. It is your responsibility to maintain
                  the security of your phone and access to the Application. The Service Provider strongly
                  advise against jailbreaking or rooting your phone, which involves removing software
                  restrictions and limitations imposed by the official operating system of your device.
                  Such actions could expose your phone to malware, viruses, malicious programs,
                  compromise your phone’s security features, and may result in the Application not
                  functioning correctly or at all.
                </p>
              </section>

              <section id="third-party">
                <h2 className="mb-4 text-2xl font-semibold">Third Party Services</h2>
                <p className="">
                  Please note that the Application utilizes third-party services that have their own
                  Terms and Conditions. Below are the links to the Terms and Conditions of the
                  third-party service providers used by the Application:
                </p>
                <ul className="mt-2 list-disc pl-6">
                  <li>
                    <a
                      href="https://policies.google.com/terms"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Google Play Services
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.facebook.com/legal/terms"
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
              </section>

              <section id="responsibility">
                <h2 className="mb-4 text-2xl font-semibold">Service Provider Responsibility</h2>
                <p className="">
                  Please be aware that the Service Provider does not assume responsibility for certain
                  aspects. Some functions of the Application require an active internet connection, which
                  can be Wi-Fi or provided by your mobile network provider. The Service Provider cannot
                  be held responsible if the Application does not function at full capacity due to lack
                  of access to Wi-Fi or if you have exhausted your data allowance.
                </p>
                <p className="mt-4">
                  In terms of the Service Provider’s responsibility for your use of the application, it
                  is important to note that while they strive to ensure that it is updated and accurate
                  at all times, they do rely on third parties to provide information to them so that they
                  can make it available to you. The Service Provider accepts no liability for any loss,
                  direct or indirect, that you experience as a result of relying entirely on this
                  functionality of the application.
                </p>
              </section>

              <section id="internet">
                <h2 className="mb-4 text-2xl font-semibold">Internet and Data Charges</h2>
                <p className="">
                  If you are using the application outside of a Wi-Fi area, please be aware that your
                  mobile network provider’s agreement terms still apply. Consequently, you may incur
                  charges from your mobile provider for data usage during the connection to the
                  application, or other third-party charges. By using the application, you accept
                  responsibility for any such charges, including roaming data charges if you use the
                  application outside of your home territory (i.e., region or country) without disabling
                  data roaming. If you are not the bill payer for the device on which you are using the
                  application, they assume that you have obtained permission from the bill payer.
                </p>
                <p className="mt-4">
                  Similarly, the Service Provider cannot always assume responsibility for your usage of
                  the application. For instance, it is your responsibility to ensure that your device
                  remains charged. If your device runs out of battery and you are unable to access the
                  Service, the Service Provider cannot be held responsible.
                </p>
              </section>

              <section id="updates">
                <h2 className="mb-4 text-2xl font-semibold">Application Updates and Termination</h2>
                <p className="">
                  The Service Provider may wish to update the application at some point. The application
                  is currently available as per the requirements for the operating system (and for any
                  additional systems they decide to extend the availability of the application to) may
                  change, and you will need to download the updates if you want to continue using the
                  application. The Service Provider does not guarantee that it will always update the
                  application so that it is relevant to you and/or compatible with the particular
                  operating system version installed on your device. However, you agree to always accept
                  updates to the application when offered to you.
                </p>
                <p className="mt-4">
                  The Service Provider may also wish to cease providing the application and may terminate
                  its use at any time without providing termination notice to you. Unless they inform you
                  otherwise, upon any termination, (a) the rights and licenses granted to you in these
                  terms will end; (b) you must cease using the application, and (if necessary) delete it
                  from your device.
                </p>
              </section>

              <section id="changes">
                <h2 className="mb-4 text-2xl font-semibold">Changes to These Terms</h2>
                <p className="">
                  The Service Provider may periodically update their Terms and Conditions. Therefore, you
                  are advised to review this page regularly for any changes. The Service Provider will
                  notify you of any changes by posting the new Terms and Conditions on this page.
                </p>
              </section>

              <section id="contact">
                <h2 className="mb-4 text-2xl font-semibold">Contact Us</h2>
                <p className="">
                  If you have any questions or suggestions about the Terms and Conditions, please do not
                  hesitate to contact the Service Provider at{' '}
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
