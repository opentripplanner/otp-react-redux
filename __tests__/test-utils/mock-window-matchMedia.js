const mockedMediaQuery = jest.fn()
mockedMediaQuery.mockReturnValue({ matches: [] })

Object.defineProperty(window, 'matchMedia', {
  value: mockedMediaQuery,
  writable: true
})
