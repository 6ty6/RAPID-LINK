let unsaved = false
export function setCmsUnsaved(value) { unsaved = value }
export function canLeaveCms() { return !unsaved || window.confirm('Discard unsaved changes and view the website?') }
