'use client'

import dynamic from 'next/dynamic'
import React from 'react'
const ResponsiveWebapp = dynamic(
  () => import('lib/components/app/responsive-webapp'),
  { ssr: false }
)

export function ClientOnly() {
  return <ResponsiveWebapp />
}
