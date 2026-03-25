import { Suspense } from 'react'
import ActivateClient from './ActivateClient'

export default function ActivatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-tornado-deep" />}>
      <ActivateClient />
    </Suspense>
  )
}
