import { Suspense } from 'react'
import LineCallbackClient from './LineCallbackClient'

export default function LineCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-tornado-deep" />}>
      <LineCallbackClient />
    </Suspense>
  )
}
