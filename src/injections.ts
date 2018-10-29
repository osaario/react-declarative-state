export function shallowCompareInjections(newObj: any, prevObj: any) {
  for (const key in newObj) {
    if (newObj[key] !== prevObj[key]) return true
  }
  return false
}
