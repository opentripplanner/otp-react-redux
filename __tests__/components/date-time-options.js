import '../test-utils/mock-window-url'
import {
  getMockInitialState,
  mockWithProvider
} from '../test-utils/mock-data/store'
import { setDefaultTestTime } from '../test-utils'
import DateTimeOptions from '../../lib/components/form/call-taker/date-time-picker'

describe('components > form > call-taker > date time options', () => {
  beforeEach(setDefaultTestTime)

  // TODO: generate each of these with a method?
  it('should render', () => {
    const mockState = getMockInitialState()

    expect(
      mockWithProvider(
        DateTimeOptions,
        { date: '2022-11-17', time: '12:34' },
        mockState
      ).snapshot()
    ).toMatchSnapshot()
  })
  it('should correctly handle "12p"', () => {
    const mockState = getMockInitialState()

    expect(
      mockWithProvider(
        DateTimeOptions,
        { date: '2022-11-17', time: '12p' },
        mockState
      ).snapshot()
    ).toMatchSnapshot()
  })
  it('should correctly handle "12a"', () => {
    const mockState = getMockInitialState()

    expect(
      mockWithProvider(
        DateTimeOptions,
        { date: '2022-11-17', time: '12a' },
        mockState
      ).snapshot()
    ).toMatchSnapshot()
  })
  it('should correctly handle "1335"', () => {
    const mockState = getMockInitialState()

    expect(
      mockWithProvider(
        DateTimeOptions,
        { date: '2022-11-17', time: '1335' },
        mockState
      ).snapshot()
    ).toMatchSnapshot()
  })
  it('should correctly handle "135p"', () => {
    const mockState = getMockInitialState()

    expect(
      mockWithProvider(
        DateTimeOptions,
        { date: '2022-11-17', time: '135p' },
        mockState
      ).snapshot()
    ).toMatchSnapshot()
  })
  it('should correctly handle "133"', () => {
    const mockState = getMockInitialState()

    expect(
      mockWithProvider(
        DateTimeOptions,
        { date: '2022-11-17', time: '133' },
        mockState
      ).snapshot()
    ).toMatchSnapshot()
  })
  it('should correctly handle "133p"', () => {
    const mockState = getMockInitialState()

    expect(
      mockWithProvider(
        DateTimeOptions,
        { date: '2022-11-17', time: '133p' },
        mockState
      ).snapshot()
    ).toMatchSnapshot()
  })
})
