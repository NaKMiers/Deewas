'use client'

import { signOut } from 'next-auth/react'

function AccountPage() {
  return (
    <div>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  )
}

export default AccountPage
