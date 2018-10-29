export type ValidationRuleType<T extends string | number | boolean> = (value: any, ruleValue: T) => Validation | null

export const notEmpty: ValidationRuleType<boolean> = (value, ruleValue) => {
  if (!ruleValue) return null
  const pass = !(value == null || value === '')
  if (pass) return null
  else return { validation: 'error', ruleValue }
}

export const minLength: ValidationRuleType<number> = (value, ruleValue) => {
  if (typeof value !== 'string') {
    throw Error("Can't have minLength rule on a non string field")
  }
  if (!ruleValue) return null
  const pass = value.length >= ruleValue
  if (pass) return null
  else return { validation: 'error', ruleValue }
}

export interface Validation {
  validation: 'error'
  ruleValue: string | number | boolean
}

/*

export const min: ValidationRuleType<number> = (value, ruleValue, S) => {
  const pass = value >= ruleValue
  if (pass) return null
  else return { validation: 'error', description: `${S.VALUE_TOO_SMALL} (min. ${ruleValue})` }
}

export const max: ValidationRuleType<number> = (value, ruleValue, S) => {
  const pass = value <= ruleValue
  if (pass) return null
  else return { validation: 'error', description: `${S.VALUE_TOO_LARGE} (max. ${ruleValue})` }
}

export const email: ValidationRuleType<boolean> = (value, ruleValue, S) => {
  if (!ruleValue || !value) return null
  const pass = isEmailValid(value)
  if (pass) return null
  else return { validation: 'error', description: S.INVALID_EMAIL }
}

export const phone: ValidationRuleType<boolean> = (value, ruleValue, S) => {
  if (!ruleValue || !value) return null
  const pass = isPhoneValid(value)
  if (pass) return null
  else return { validation: 'error', description: S.INCORRECT_FORMAT }
}

*/
export const formRules = { notEmpty, minLength }
