'use client'

import { signOut } from 'next-auth/react'

function HomePage() {
  return (
    <div>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  )
}

export default HomePage
