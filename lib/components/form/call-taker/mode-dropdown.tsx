import { connect } from 'react-redux'

import { getModuleConfig, Modules } from '../../../util/config'
import { TransportMode } from '@opentripplanner/types'
import React, { useState } from 'react'

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
  const [selectedMode, setSelectedMode] = useState(modeDropdownOptions[0].label)

  const onChange = React.useCallback(
    (e: React.FocusEvent<HTMLSelectElement>) => {
      setSelectedMode(e.target.value)
      const newModes = modeDropdownOptions.find(
        (mdo) => mdo.label === e.target.value
      )?.combination
      onChangeModes(newModes || [])
    },
    []
  )

  return (
    <select onBlur={onChange} onChange={onChange} value={selectedMode}>
      {modeDropdownOptions?.map((o) => (
        <option key={o.label} value={o.label}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

const mapStateToProps = (state: any) => {
  const moduleConfig = getModuleConfig(state, Modules.CALL_TAKER).options
  return {
    modeDropdownOptions: moduleConfig.modeDropdownOptions
  }
}

export default connect(mapStateToProps)(ModeDropdown)
