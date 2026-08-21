/**
 * Duplicate Tab - Manifest V3 service worker.
 *
 * Every listener is registered synchronously at the top level. An MV3 worker is
 * torn down once idle and re-evaluated from scratch on the next event, so a
 * listener registered inside a callback or after an `await` would be missed.
 */

const DUPLICATE_COMMAND = 'duplicate-tab-keyboard-shortcut';
const CLOSE_OTHERS_COMMAND = 'close-other-tabs-shortcut';

/**
 * Mirrors `chrome.tabGroups.TAB_GROUP_ID_NONE`, inlined on purpose: the
 * `tabGroups` namespace only exists once the matching permission is granted,
 * while `Tab.groupId` is populated regardless. Reading the constant from the
 * namespace would cost a permission for a value that never changes.
 */
const TAB_GROUP_ID_NONE = -1;

/** Bump when the welcome page gains something users need to see again. */
const NOTICE_VERSION = 1;
const NOTICE_KEY = 'shortcutNoticeVersion';

/**
 * Extracts an actionable tab id.
 *
 * DevTools windows and detached targets report `TAB_ID_NONE` (-1), which every
 * `chrome.tabs.*` call rejects on.
 *
 * @param {chrome.tabs.Tab | undefined} tab
 * @returns {number | undefined}
 */
function tabIdOf(tab) {
  const id = tab?.id;
  if (id === undefined || id === chrome.tabs.TAB_ID_NONE) {
    return undefined;
  }
  return id;
}

/**
 * @param {chrome.tabs.Tab | undefined} tab
 * @returns {Promise<void>}
 */
async function duplicateTab(tab) {
  const id = tabIdOf(tab);
  if (id === undefined) {
    return;
  }
  try {
    await chrome.tabs.duplicate(id);
  } catch (error) {
    // The tab can be closed or mid-drag between windows by the time we get here.
    console.warn('Duplicate Tab: could not duplicate tab', error);
  }
}

/**
 * Closes every unpinned, ungrouped, inactive tab in the same window as `tab`.
 *
 * Scoped by `windowId` rather than `currentWindow`/`lastFocusedWindow`: a
 * service worker has no window of its own, so those filters only ever resolve
 * to the last focused window and would close the wrong tabs if the shortcut
 * fired in a background window.
 *
 * Grouped tabs are spared alongside pinned ones. Chrome's own "Close other
 * tabs" does close them, but a group is something the user deliberately set
 * aside, and losing one whole is a far worse outcome than leaving a few tabs
 * open.
 *
 * @param {chrome.tabs.Tab | undefined} tab
 * @returns {Promise<void>}
 */
async function closeOtherTabs(tab) {
  if (!tab) {
    return;
  }

  const others = await chrome.tabs.query({
    windowId: tab.windowId,
    active: false,
    pinned: false,
  });

  /** @type {number[]} */
  const ids = [];
  for (const other of others) {
    if (other.groupId !== TAB_GROUP_ID_NONE) {
      continue;
    }
    const id = tabIdOf(other);
    if (id !== undefined) {
      ids.push(id);
    }
  }

  if (ids.length === 0) {
    return;
  }

  try {
    await chrome.tabs.remove(ids);
  } catch (error) {
    console.warn('Duplicate Tab: could not close tabs', error);
  }
}

/**
 * Opens the welcome page once per notice version, so an update that changes the
 * default shortcuts can explain itself exactly one time.
 *
 * @returns {Promise<void>}
 */
async function showNoticeOnce() {
  const stored = await chrome.storage.local.get(NOTICE_KEY);
  if (stored[NOTICE_KEY] === NOTICE_VERSION) {
    return;
  }
  // Recorded before opening the tab: a failed `tabs.create` is a far better
  // outcome than a notice that reopens on every worker wake-up.
  await chrome.storage.local.set({ [NOTICE_KEY]: NOTICE_VERSION });
  await chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
}

chrome.action.onClicked.addListener(duplicateTab);

chrome.commands.onCommand.addListener((command, tab) => {
  // Chrome hands us the tab the shortcut fired on, so there is no `tabs.query`
  // round trip and no ambiguity about which window is "current".
  if (command === DUPLICATE_COMMAND) {
    void duplicateTab(tab);
  } else if (command === CLOSE_OTHERS_COMMAND) {
    void closeOtherTabs(tab);
  }
});

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install' || reason === 'update') {
    void showNoticeOnce();
  }
});
