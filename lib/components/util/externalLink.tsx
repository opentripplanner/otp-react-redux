import { ExternalLinkAlt } from '@styled-icons/fa-solid'
import { useIntl } from 'react-intl'
import React, { HTMLAttributes } from 'react'

interface LinkProps extends HTMLAttributes<HTMLElement> {
  contents: JSX.Element | string
  gap?: number
  inline?: boolean
  size?: number
  style?: React.CSSProperties
  url: string
}

interface IconProps extends HTMLAttributes<HTMLElement> {
  size?: number
  style?: React.CSSProperties
}

export const NewWindowIconA11y = ({
  size = 14,
  style
}: IconProps): JSX.Element => {
  const intl = useIntl()
  return (
    <ExternalLinkAlt
      /* the "title" prop removes aria-hidden from styled-icons, so use the title as the aria-label as well
        https://github.com/styled-icons/styled-icons#accessibility */
      aria-labelledby="title"
      height={size}
      style={style}
      title={intl.formatMessage({ id: 'common.linkOpensNewWindow' })}
    />
  )
}

export const LinkOpensNewWindow = ({
  contents,
  gap = 6,
  inline,
  size = 14,
  style,
  url
}: LinkProps): JSX.Element => {
  return (
    <a
      href={url}
      rel="noreferrer"
      style={{
        alignItems: 'center',
        display: `${inline ? 'inline-flex' : 'flex'}`,
        flexDirection: 'row',
        gap,
        whiteSpace: 'nowrap',
        ...style
      }}
      target="_blank"
    >
      {contents}
      <NewWindowIconA11y size={size} />
    </a>
  )
}
