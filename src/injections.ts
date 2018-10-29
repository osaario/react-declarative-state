export function shallowCompareInjections(newObj: object, prevObj: object) {
  for (const key in newObj) {
    if (newObj[key] !== prevObj[key]) return true
  }
  return false
}
