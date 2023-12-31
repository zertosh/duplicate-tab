/* global chrome */

chrome.action.onClicked.addListener(tab => {
  chrome.tabs.duplicate(tab.id);
});

chrome.commands.onCommand.addListener(async command => {
  if (command === 'duplicate-tab-keyboard-shortcut') {
    const tabList = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    for (const tab of tabList) {
      chrome.tabs.duplicate(tab.id);
    }
  }
  if (command === 'close-other-tabs-shortcut') {
    const tabList = await chrome.tabs.query({
      active: false,
      pinned: false,
      currentWindow: true,
    });
    chrome.tabs.remove(tabList.map(tab => tab.id));
  }
});
