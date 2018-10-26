export interface Validation {
  validation: 'error'
  description: string
}

export type ValidationRuleType<T extends string | number | boolean> = (
  value: any,
  ruleValue: T
) => Validation | null

export const notEmpty: ValidationRuleType<boolean> = (value, ruleValue) => {
  if (!ruleValue) return null
  const pass = !(value == null || value === '')
  if (pass) return null
  else return { validation: 'error', description: "Field can't be empty" }
}

export const formRules = { notEmpty }
