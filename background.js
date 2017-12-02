'use strict';
/* global chrome */

chrome.browserAction.onClicked.addListener(tab => {
  chrome.tabs.duplicate(tab.id);
});

chrome.commands.onCommand.addListener(command => {
  if (command === 'duplicate-tab-keyboard-shortcut') {
    chrome.tabs.getSelected(null, tab => {
      chrome.tabs.duplicate(tab.id);
    });
  } if (command === 'close-other-tabs-shortcut') {
    chrome.tabs.query({
      active: false,
      pinned: false,
      currentWindow: true,
    }, tabList => {
      chrome.tabs.remove(tabList.map(tab => tab.id));
    });
  }
});
