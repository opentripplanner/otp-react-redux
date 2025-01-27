import {
  addSettingsToButton,
  AdvancedModeSubsettingsContainer,
  DropdownSelector,
  ModeSettingRenderer,
  populateSettingWithValue
} from '@opentripplanner/trip-form'
import { ArrowLeft } from '@styled-icons/fa-solid/ArrowLeft'
import { Check } from '@styled-icons/boxicons-regular'
import { connect } from 'react-redux'
import { decodeQueryParams, DelimitedArrayParam } from 'serialize-query-params'
import { FormattedMessage, IntlShape, useIntl } from 'react-intl'
import { invisibleCss } from '@opentripplanner/trip-form/lib/MetroModeSelector'
import {
  ModeButtonDefinition,
  ModeSetting,
  ModeSettingValues
} from '@opentripplanner/types'
import { QueryParamChangeEvent } from '@opentripplanner/trip-form/lib/types'
import React, {
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import styled from 'styled-components'

import * as formActions from '../../actions/form'
import * as userActions from '../../actions/user'
import { AppReduxState } from '../../util/state-types'
import { blue, getBaseColor } from '../util/colors'
import { ComponentContext } from '../../util/contexts'
import { generateModeSettingValues } from '../../util/api'
import { getDependentName } from '../../util/user'
import { User } from '../user/types'

import {
  addCustomSettingLabels,
  addModeButtonIcon,
  onSettingsUpdate,
  pipe,
  populateSettingWithIcon,
  setModeButton,
  tripPlannerValidationErrors
} from './util'
import { setModeButtonEnabled } from './batch-settings'
import { styledCheckboxCss } from './styled'
import DateTimeModal from './date-time-modal'

const PanelOverlay = styled.div`
  height: 100%;
  left: 0;
  overflow-y: auto;
  padding: 1.5em;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 100;
`

const GlobalSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 13px;
  margin-bottom: 2em;

  ${styledCheckboxCss}
`

const CloseButton = styled.button`
  background: transparent;
  border: none;
`

const HeaderContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 10px;
  height: 30px;
`

const InvisibleSubheader = styled.h2`
  ${invisibleCss}
`
const VisibleSubheader = styled.h2`
  display: block;
  font-size: 18px;
  font-weight: 700;
  height: auto;
  margin: 1em 0;
  position: static;
  width: auto;
`
const ReturnToTripPlanButton = styled.button`
  align-items: center;
  background-color: var(--main-base-color, ${blue[900]});
  border: 0;
  color: white;
  display: flex;
  font-weight: 700;
  gap: 5px;
  height: 51px;
  justify-content: center;
  margin-top: 2em;
  width: 100%;

  svg {
    margin-bottom: 7px;
  }
`

const DtSelectorContainer = styled.div`
  margin: 2em 0;

  .date-time-modal {
    padding: 0;

    .main-panel {
      margin: 0;

      button {
        padding: 6px 0;
      }

      .date-time-selector {
        margin: 15px 0;
      }
    }
  }
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

const AdvancedSettingsPanel = ({
  autoPlan,
  closeAdvancedSettings,
  currentQuery,
  enabledModeButtons,
  getDependentUserInfo,
  handlePlanTrip,
  innerRef,
  loggedInUser,
  mobilityProfile,
  modeButtonOptions,
  modeSettingDefinitions,
  modeSettingValues,
  saveAndReturnButton,
  setCloseAdvancedSettingsWithDelay,
  setQueryParam
}: {
  autoPlan: boolean
  closeAdvancedSettings: () => void
  currentQuery: any
  enabledModeButtons: string[]
  getDependentUserInfo: (userIds: string[], intl: IntlShape) => void
  handlePlanTrip: () => void
  innerRef: RefObject<HTMLDivElement>
  loggedInUser?: User
  mobilityProfile: boolean
  modeButtonOptions: ModeButtonDefinition[]
  modeSettingDefinitions: ModeSetting[]
  modeSettingValues: ModeSettingValues
  saveAndReturnButton?: boolean
  setCloseAdvancedSettingsWithDelay: () => void
  setQueryParam: (evt: any) => void
}): JSX.Element => {
  const intl = useIntl()
  const [closingBySave, setClosingBySave] = useState(false)
  const [selectedMobilityProfile, setSelectedMobilityProfile] =
    useState<string>(currentQuery.forEmail || loggedInUser?.email)
  const dependents = useMemo(
    () => loggedInUser?.dependents || [],
    [loggedInUser]
  )

  useEffect(() => {
    if (mobilityProfile && dependents.length > 0) {
      getDependentUserInfo(dependents, intl)
    }
  }, [dependents, getDependentUserInfo, intl, mobilityProfile])

  const baseColor = getBaseColor()
  const accentColor = baseColor || blue[900]

  const closeButtonText = intl.formatMessage({
    id: 'components.BatchSearchScreen.saveAndReturn'
  })
  const headerText = intl.formatMessage({
    id: 'components.BatchSearchScreen.advancedHeader'
  })

  // @ts-expect-error Context not typed
  const { ModeIcon } = useContext(ComponentContext)

  const processSettings = (settings: ModeSetting[]) =>
    settings.map(
      pipe(
        populateSettingWithIcon(ModeIcon),
        populateSettingWithValue(modeSettingValues),
        addCustomSettingLabels(intl)
      )
    )

  const globalSettings = modeSettingDefinitions.filter((x) => !x.applicableMode)
  const processedGlobalSettings = processSettings(globalSettings)

  const globalSettingsComponents = processedGlobalSettings.map(
    (setting: ModeSetting) => (
      <ModeSettingRenderer
        key={setting.key}
        onChange={onSettingsUpdate(setQueryParam)}
        setting={setting}
      />
    )
  )

  const processedModeSettings = processSettings(modeSettingDefinitions)
  const processedModeButtons = modeButtonOptions.map(
    pipe(
      addModeButtonIcon(ModeIcon),
      addSettingsToButton(processedModeSettings),
      setModeButtonEnabled(enabledModeButtons)
    )
  )

  const tripFormErrors = tripPlannerValidationErrors(currentQuery, intl)

  const closePanel = useCallback(() => {
    // Only autoplan if there are no validation errors
    tripFormErrors.length === 0 && autoPlan && handlePlanTrip()
    closeAdvancedSettings()
  }, [autoPlan, closeAdvancedSettings, handlePlanTrip, tripFormErrors.length])

  const handleModeButtonToggle = setModeButton(
    enabledModeButtons,
    onSettingsUpdate(setQueryParam)
  )

  const handleAllSubmodesDisabled = (modeButton: ModeButtonDefinition) => {
    handleModeButtonToggle(modeButton.key, false)
  }

  const onSaveAndReturnClick = useCallback(async () => {
    await setCloseAdvancedSettingsWithDelay()
    setClosingBySave(true)
    closePanel()
  }, [closePanel, setCloseAdvancedSettingsWithDelay])

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
  return (
    <PanelOverlay className="advanced-settings" ref={innerRef}>
      <HeaderContainer>
        <CloseButton
          aria-label={closeButtonText}
          id="close-advanced-settings-button"
          onClick={() => {
            closePanel()
          }}
          title={closeButtonText}
        >
          <ArrowLeft size={22} />
        </CloseButton>
        <h1 className="header-text">{headerText}</h1>
      </HeaderContainer>
      <DtSelectorContainer>
        <DateTimeModal />
      </DtSelectorContainer>
      {processedGlobalSettings.length > 0 && (
        <>
          <InvisibleSubheader>
            <FormattedMessage id="components.BatchSearchScreen.tripOptions" />
          </InvisibleSubheader>
          <GlobalSettingsContainer className="global-settings-container">
            {globalSettingsComponents}
          </GlobalSettingsContainer>
        </>
      )}
      {loggedInUser?.dependentsInfo?.length && (
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
                value: loggedInUser?.email
              },
              ...(loggedInUser?.dependentsInfo?.map((user) => ({
                text: getDependentName(user),
                value: user.email
              })) || [])
            ]}
            value={selectedMobilityProfile}
          />
        </MobilityProfileContainer>
      )}

      <AdvancedModeSubsettingsContainer
        accentColor={accentColor}
        fillModeIcons
        label={intl.formatMessage({
          id: 'components.BatchSearchScreen.submodeSelectorLabel'
        })}
        modeButtons={processedModeButtons}
        onAllSubmodesDisabled={handleAllSubmodesDisabled}
        onSettingsUpdate={onSettingsUpdate(setQueryParam)}
        onToggleModeButton={handleModeButtonToggle}
      />
      {saveAndReturnButton && (
        <ReturnToTripPlanButton
          className="save-settings-button"
          onClick={onSaveAndReturnClick}
        >
          {closingBySave ? (
            <>
              <FormattedMessage id="components.BatchSearchScreen.saved" />
              <Check size={22} />
            </>
          ) : (
            <FormattedMessage id="components.BatchSearchScreen.saveAndReturn" />
          )}
        </ReturnToTripPlanButton>
      )}
    </PanelOverlay>
  )
}
const queryParamConfig = { modeButtons: DelimitedArrayParam }

const mapStateToProps = (state: AppReduxState) => {
  const urlSearchParams = new URLSearchParams(state.router.location.search)
  const { modes } = state.otp.config
  const modeSettingValues = generateModeSettingValues(
    urlSearchParams,
    state.otp.modeSettingDefinitions || [],
    modes?.initialState?.modeSettingValues || {}
  )

  const { autoPlan } = state.otp.config
  const saveAndReturnButton =
    state.otp.config?.advancedSettingsPanel?.saveAndReturnButton
  return {
    autoPlan: autoPlan !== false,
    currentQuery: state.otp.currentQuery,
    // TODO: Duplicated in apiv2.js
    enabledModeButtons:
      decodeQueryParams(queryParamConfig, {
        modeButtons: urlSearchParams.get('modeButtons')
      })?.modeButtons?.filter((mb): mb is string => mb !== null) ||
      modes?.initialState?.enabledModeButtons ||
      [],
    loggedInUser: state.user.loggedInUser,
    mobilityProfile: state.otp.config?.mobilityProfile || false,
    modeButtonOptions: modes?.modeButtons || [],
    modeSettingDefinitions: state.otp?.modeSettingDefinitions || [],
    modeSettingValues,
    saveAndReturnButton
  }
}

const mapDispatchToProps = {
  getDependentUserInfo: userActions.getDependentUserInfo,
  setQueryParam: formActions.setQueryParam
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdvancedSettingsPanel)
