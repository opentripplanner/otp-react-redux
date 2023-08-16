import { connect } from 'react-redux'
import { TransportMode } from '@opentripplanner/types'
import { useQueryParam } from 'use-query-params'
import React, { useEffect } from 'react'

import { defaultDropdownConfig } from '../../../util/call-taker'
import { getModuleConfig, Modules } from '../../../util/config'

type DropdownOption = {
  combination: TransportMode[]
  label: string
}

type Props = {
  modeDropdownOptions: DropdownOption[]
  onChangeModes: (combination: TransportMode[]) => void
}

/**
 * Dropdown selector for the Call Taker form that allows quick selection of the
 * full set of exclusive modes and access modes + transit. This will also
 * automatically apply any companies associated with the mode option to the
 * query params (e.g., Uber for CAR_HAIL or one of the various bike/scooter
 * rental companies).
 */
function ModeDropdown({ modeDropdownOptions, onChangeModes }: Props) {
  const [selectedMode, setSelectedMode] = useQueryParam(
    modeDropdownOptions[0].label
  )

  const onChange = React.useCallback(
    (e: React.FocusEvent<HTMLSelectElement>) => {
      setSelectedMode(e.target.value)
    },
    []
  )

  useEffect(() => {
    if (selectedMode === undefined) {
      setSelectedMode(modeDropdownOptions?.[0].label)
      return
    }

    const newModes = modeDropdownOptions.find(
      (mdo) => mdo.label === selectedMode
    )?.combination
    onChangeModes(newModes || [])
  }, [selectedMode, modeDropdownOptions, onChangeModes])

  return (
    <select
      onBlur={onChange}
      onChange={onChange}
      value={
        typeof selectedMode === 'string'
          ? selectedMode
          : modeDropdownOptions?.[0].label
      }
    >
      {modeDropdownOptions?.map((o) => (
        <option key={o.label} value={o.label}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

const mapStateToProps = (state: any) => {
  const moduleConfig = getModuleConfig(state, Modules.CALL_TAKER)?.options
  return {
    modeDropdownOptions:
      moduleConfig?.modeDropdownOptions || defaultDropdownConfig
  }
}

export default connect(mapStateToProps)(ModeDropdown)
