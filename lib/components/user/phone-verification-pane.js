import React from 'react'
import { Alert, FormControl, FormGroup } from 'react-bootstrap'

/**
 * User phone verification pane.
 * TODO: to be completed.
 */
const phoneVerificationPane = (
  <div>
    <Alert bsStyle='warning'>
      <strong>Under construction!</strong>
    </Alert>
    <p>
      Please check your mobile phone's SMS messaging app for a text
      message with a verification code and copy the code below:
    </p>
    <FormGroup bsSize='large'>
      <FormControl type='number' placeholder='_ _ _ _ _ _' />
    </FormGroup>
  </div>
)

export default phoneVerificationPane
