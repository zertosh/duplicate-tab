'use strict';
/* global chrome */

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.duplicate(tab.id);
});

chrome.commands.onCommand.addListener(function(command) {
  if (command === 'duplicate-tab-keyboard-shortcut') {
    chrome.tabs.getSelected(null, function(tab) {
      chrome.tabs.duplicate(tab.id);
    });
  }
});
