export function getSelectedIndexes(objects) {
  return objects.reduce((result, object, index) => {
    if (object.selected) result.push(index)
    return result
  }, [])
}

export function getProperty(object, property) {
  if (object) return object[property]
  else return ""
}

export function getZ() {
  return new Date().getTime() - 1589637000000
}