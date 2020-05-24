const DELTA = 50;

export function scrollDown() {
  window.scrollBy(0, DELTA)
}

export function scrollUp() {
  window.scrollBy(0, -DELTA)
}

export function scrollLeft() {
  window.scrollBy(-DELTA, 0)
}

export function scrollRight() {
  window.scrollBy(DELTA, 0)
}