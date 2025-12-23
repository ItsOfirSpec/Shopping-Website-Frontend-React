export function removeByValue(array, val) {
  return array.filter(item => item !== val);
}
export function shuffleArray(arr) {
  return arr
    .map((v) => ({ v, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((o) => o.v);
}
