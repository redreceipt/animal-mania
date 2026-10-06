// Keep native Tab/Enter/Space behavior; add arcade navigation and recover focus
// when React replaces a screen or temporarily disables the move buttons.
export function setupKeyboardNavigation(root) {
  let keyboard = false
  let lastFocus = null
  let lastGroup = null
  let needsFocus = false
  const controls = () => [...root.querySelectorAll('button:not(:disabled), input:not(:disabled)')]
  const focus = (element) => element?.focus()

  function recoverFocus() {
    if (!keyboard || !lastFocus) return
    const active = document.activeElement
    if (root.contains(active) && !active.disabled) return
    if (active !== document.body && !root.contains(active)) return
    if (lastFocus.isConnected && !lastFocus.disabled && !needsFocus) return
    needsFocus = true
    const group = root.contains(lastGroup) ? lastGroup : root.querySelector('.move-panel') ?? root
    // Stay in a filtered roster, or wait for a legal move instead of jumping away.
    focus(group.querySelector('button:not(:disabled), input:not(:disabled)')
      ?? (group.matches('.roster') ? group.parentElement.querySelector('input') : null))
  }

  function focusin(event) {
    lastFocus = root.contains(event.target) ? event.target : null
    lastGroup = lastFocus?.closest('.roster, .move-panel')
    needsFocus = false
  }

  function pointerdown() {
    keyboard = false
    root.classList.remove('keyboard-navigation')
  }

  function keydown(event) {
    if ((event.altKey && event.key !== 'Tab') || event.ctrlKey || event.metaKey || event.isComposing) return
    const active = document.activeElement
    if (active !== document.body && !root.contains(active)) return
    if (!['Tab', 'Enter', ' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '1', '2', '3', '4'].includes(event.key)) return
    keyboard = true
    root.classList.add('keyboard-navigation')
    if (active.matches('input, textarea, select') || active.isContentEditable) return
    if (event.repeat && ['Enter', ' ', '1', '2', '3', '4'].includes(event.key)) {
      event.preventDefault()
      return
    }
    if (/^[1-4]$/.test(event.key)) {
      const move = root.querySelectorAll('.move-card')[Number(event.key) - 1]
      if (move) {
        event.preventDefault()
        if (!move.disabled) {
          focus(move)
          move.click()
        }
      }
      return
    }
    if (event.key === 'Tab') return
    const available = controls()
    const index = available.indexOf(active)
    if (index === -1) {
      event.preventDefault()
      focus(root.querySelector('.move-card:not(:disabled)') ?? available[0])
      return
    }
    if (!event.key.startsWith('Arrow')) return
    event.preventDefault()
    const direction = ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1
    const grid = active.closest('.roster, .move-grid, .mode-options')
    if (grid && ['ArrowUp', 'ArrowDown'].includes(event.key)) {
      const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length
      const items = [...grid.querySelectorAll('button')]
      for (let next = items.indexOf(active) + columns * direction; next >= 0 && next < items.length; next += columns * direction) {
        if (!items[next].disabled) {
          focus(items[next])
          return
        }
      }
      // No further target in this column: keep moving in DOM order so
      // arrows can leave a grid (e.g. down to Start showdown) instead of trapping focus.
      focus(available[index + direction])
      return
    }
    focus(available[index + direction])
  }

  const observer = new MutationObserver(recoverFocus)
  observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] })
  document.addEventListener('keydown', keydown)
  document.addEventListener('pointerdown', pointerdown)
  document.addEventListener('focusin', focusin)
  return () => {
    observer.disconnect()
    document.removeEventListener('keydown', keydown)
    document.removeEventListener('pointerdown', pointerdown)
    document.removeEventListener('focusin', focusin)
    root.classList.remove('keyboard-navigation')
  }
}
