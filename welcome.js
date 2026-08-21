/**
 * Welcome page: localises the static markup and renders the shortcuts that are
 * actually bound right now, rather than the defaults the manifest asked for.
 */

/**
 * Renders one "Alt+Shift+D" string as a row of <kbd> elements.
 *
 * @param {string} shortcut
 * @returns {(HTMLElement | string)[]}
 */
function keyElements(shortcut) {
  /** @type {(HTMLElement | string)[]} */
  const parts = [];
  for (const key of shortcut.split('+')) {
    if (parts.length > 0) {
      parts.push(' + ');
    }
    const kbd = document.createElement('kbd');
    kbd.textContent = key;
    parts.push(kbd);
  }
  return parts;
}

/**
 * @param {chrome.commands.Command} command
 * @returns {HTMLElement}
 */
function shortcutRow(command) {
  const term = document.createElement('dt');
  term.textContent = command.description ?? command.name ?? '';

  const value = document.createElement('dd');
  if (command.shortcut) {
    value.append(...keyElements(command.shortcut));
  } else {
    // Chrome silently drops a suggested_key that another extension already
    // claimed, so an empty string here is a real state users hit.
    value.textContent = chrome.i18n.getMessage('shortcutNotSet');
    value.className = 'unset';
  }

  const row = document.createElement('div');
  row.append(term, value);
  return row;
}

async function renderShortcuts() {
  const list = document.querySelector('#shortcuts');
  if (!list) {
    return;
  }
  const commands = await chrome.commands.getAll();
  const rows = commands.filter((command) => command.description).map(shortcutRow);
  if (rows.length > 0) {
    // Replaces the hard-coded defaults that ship as a fallback in the markup.
    list.replaceChildren(...rows);
  }
}

function localise() {
  document.documentElement.lang = chrome.i18n.getUILanguage();
  for (const element of document.querySelectorAll('[data-i18n]')) {
    const message = chrome.i18n.getMessage(element.getAttribute('data-i18n') ?? '');
    if (message) {
      element.textContent = message;
    }
  }
}

localise();
void renderShortcuts();

// A plain <a href="chrome://..."> is blocked by the browser; tabs.create from an
// extension page is not.
document.querySelector('#open-shortcuts')?.addEventListener('click', () => {
  void chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
});
