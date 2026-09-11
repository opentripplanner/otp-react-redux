import { connect } from 'react-redux'
import { DropdownSelector } from '@opentripplanner/trip-form'
import { FormattedMessage, IntlShape, useIntl } from 'react-intl'
import { QueryParamChangeEvent } from '@opentripplanner/trip-form/lib/types'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import * as formActions from '../../../actions/form'
import * as userActions from '../../../actions/user'
import { AppReduxState } from '../../../util/state-types'
import { getDependentName } from '../../../util/user'
import { User } from '../../user/types'
import AppModule from '../../app/app-module'

const VisibleSubheader = styled.h2`
  display: block;
  font-size: 18px;
  font-weight: 700;
  height: auto;
  margin: 1em 0;
  position: static;
  width: auto;
`

const MobilityProfileContainer = styled.div`
  margin: 60px 0 60px 5px;
`

const MobilityProfileDropdown = styled(DropdownSelector)`
  margin: 20px 0px;
  label {
    padding-left: 0;
  }
`

const DependentSelector = ({
  currentQuery,
  getDependentUserInfo,
  loggedInUser,
  setQueryParam
}: {
  currentQuery: any
  getDependentUserInfo: (userIds: string[], intl: IntlShape) => void
  loggedInUser?: User
  setQueryParam: (evt: any) => void
}): JSX.Element | null => {
  const intl = useIntl()
  const [selectedMobilityProfile, setSelectedMobilityProfile] =
    useState<string>(currentQuery.forEmail || loggedInUser?.email)

  const dependents = useMemo(
    () => loggedInUser?.dependents || [],
    [loggedInUser]
  )

  useEffect(() => {
    if (dependents.length > 0) {
      getDependentUserInfo(dependents, intl)
    }
  }, [dependents, getDependentUserInfo, intl])

  const onMobilityProfileChange = useCallback(
    (evt: QueryParamChangeEvent) => {
      const value = evt.forEmail
      setSelectedMobilityProfile(value as string)
      setQueryParam({
        forEmail: value
      })
    },
    [setSelectedMobilityProfile, setQueryParam]
  )

  if (!loggedInUser) return null

  return (
    <AppModule name="mobilityprofile">
      <MobilityProfileContainer>
        <VisibleSubheader>
          <FormattedMessage id="components.MobilityProfile.MobilityPane.header" />
        </VisibleSubheader>
        <FormattedMessage id="components.MobilityProfile.MobilityPane.planTripDescription" />
        <MobilityProfileDropdown
          label={intl.formatMessage({
            id: 'components.MobilityProfile.dropdownLabel'
          })}
          name="forEmail"
          onChange={onMobilityProfileChange}
          options={[
            {
              text: intl.formatMessage({
                id: 'components.MobilityProfile.myself'
              }),
              value: loggedInUser.email
            },
            ...(loggedInUser.dependentsInfo?.map((user) => ({
              text: getDependentName(user),
              value: user.email
            })) || [])
          ]}
          value={selectedMobilityProfile}
        />
      </MobilityProfileContainer>
    </AppModule>
  )
}

const mapStateToProps = (state: AppReduxState) => ({
  currentQuery: state.otp.currentQuery,
  loggedInUser: state.user.loggedInUser
})

const mapDispatchToProps = {
  getDependentUserInfo: userActions.getDependentUserInfo,
  setQueryParam: formActions.setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(DependentSelector)
