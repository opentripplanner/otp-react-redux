import React from 'react'

import AppModule from '../app/app-module'
import DependentSelector from '../user/mobility-profile/dependent-selector'

const AdvancedSettingsMobilityProfile = (): JSX.Element | null => (
  <AppModule name="mobilityprofile">
    <DependentSelector />
  </AppModule>
)

export default AdvancedSettingsMobilityProfile
