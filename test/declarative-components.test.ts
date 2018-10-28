import { notEmpty } from '../src/formrules'

/**
 * Dummy test
 */
describe('Form rules tests', () => {
  it('notEmpty tests', () => {
    expect(notEmpty('', true)).toBeTruthy()
    expect(notEmpty('geg', true)).toBeNull()
  })
})
