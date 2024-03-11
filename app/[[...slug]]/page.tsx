import React from 'react'

import { ClientOnly } from './client'

const otpConfig = require('../../config.yaml')
// const jsConfig = require(process.env.JS_CONFIG || '').configure(otpConfig)
const jsConfig = {}

export function generateStaticParams() {
  return [{ slug: [''] }]
}

export default function Page() {
  return <ClientOnly jsConfig={jsConfig} otpConfig={otpConfig} />
}
