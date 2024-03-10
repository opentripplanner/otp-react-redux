import '../index.css'
import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'OpenTripPlanner'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css?family=Hind:300,400,500,600,700"
          rel="stylesheet"
        />
        <title>OpenTripPlanner</title>
      </head>
      <body>
        <div id="main">{children}</div>
      </body>
    </html>
  )
}
