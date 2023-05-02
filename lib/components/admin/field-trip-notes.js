/* eslint-disable react/prop-types */
import { Badge, Button as BsButton } from 'react-bootstrap'
import { Plus } from '@styled-icons/fa-solid/Plus'
import { StickyNote } from '@styled-icons/fa-regular/StickyNote'
import { Trash } from '@styled-icons/fa-solid/Trash'
import React, { Component } from 'react'
import styled from 'styled-components'

import { IconWithText, StyledIconWrapper } from '../util/styledIcon'

import { Button, Full, Header } from './styled'

const Quote = styled.p`
  font-size: small;
  margin-bottom: 5px;
`

const Footer = styled.footer`
  font-size: x-small;
`

const Note = ({ note, onClickDelete }) => (
  <blockquote>
    <BsButton
      bsSize="xsmall"
      className="pull-right"
      onClick={() => onClickDelete(note)}
    >
      <StyledIconWrapper className="text-danger">
        <Trash />
      </StyledIconWrapper>
    </BsButton>
    <Quote>{note.note}</Quote>
    <Footer>
      {note.userName} on <em>{note.timeStamp}</em>
    </Footer>
  </blockquote>
)

const Feedback = ({ feedback }) => (
  <blockquote>
    <Quote>{feedback.feedback}</Quote>
    <Footer>
      {feedback.userName} on <em>{feedback.timeStamp}</em>
    </Footer>
  </blockquote>
)
/**
 * Renders the various notes/feedback for a field trip request.
 */
export default class FieldTripNotes extends Component {
  _getNotesCount = () => {
    const { request } = this.props
    const { feedback, notes } = request
    let notesCount = 0
    if (notes && notes.length) notesCount += notes.length
    if (feedback && feedback.length) notesCount += feedback.length
    return notesCount
  }

  _addInternalNote = () => this._addNote('internal')

  _addOperationalNote = () => this._addNote('operational')

  _addNote = (type) => {
    const { addFieldTripNote, intl, request } = this.props
    const note = prompt(`Type ${type} note to be attached to this request:`)
    if (note) addFieldTripNote(request, { note, type }, intl)
  }

  _deleteNote = (note) => {
    const { deleteFieldTripNote, intl, request } = this.props
    if (
      window.confirm(`Are you sure you want to delete note "${note.note}"?`)
    ) {
      deleteFieldTripNote(request, note.id, intl)
    }
  }

  render() {
    const { request } = this.props
    if (!request) return null
    const { feedback, notes } = request
    const internalNotes = []
    const operationalNotes = []
    notes &&
      notes.forEach((note) => {
        if (note.type === 'internal') internalNotes.push(note)
        else operationalNotes.push(note)
      })
    return (
      <Full>
        <Header>
          <IconWithText Icon={StickyNote}>
            Notes/Feedback <Badge>{this._getNotesCount()}</Badge>
          </IconWithText>
          <Button bsSize="xs" onClick={this._addInternalNote}>
            <IconWithText Icon={Plus}>Internal note</IconWithText>
          </Button>
          <Button bsSize="xs" onClick={this._addOperationalNote}>
            <IconWithText Icon={Plus}>Ops. note</IconWithText>
          </Button>
        </Header>
        <h5>Internal agent notes</h5>
        {internalNotes && internalNotes.length > 0
          ? internalNotes.map((n) => (
              // eslint-disable-next-line react/jsx-indent
              <Note key={n.id} note={n} onClickDelete={this._deleteNote} />
            ))
          : 'No internal notes submitted.'}
        <h5>Operational notes</h5>
        {operationalNotes && operationalNotes.length > 0
          ? operationalNotes.map((n) => (
              // eslint-disable-next-line react/jsx-indent
              <Note key={n.id} note={n} onClickDelete={this._deleteNote} />
            ))
          : 'No operational notes submitted.'}
        <h5>User feedback</h5>
        {feedback && feedback.length > 0
          ? feedback.map((f, i) => <Feedback feedback={f} key={i} />)
          : 'No feedback submitted.'}
      </Full>
    )
  }
}
