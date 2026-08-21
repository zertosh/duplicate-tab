# Changelog

## 2.1.0

### Fixed

- Failed tab operations no longer end as unhandled promise rejections. Duplicating
  a tab that was closed or dragged mid-action now fails quietly instead of
  silently doing nothing with an error buried in the worker log.
- DevTools windows and other targets reporting `TAB_ID_NONE` are skipped rather
  than passed to `chrome.tabs.*`, which always rejected on them.
- "Close other tabs" is now scoped to the window the shortcut fired in. It
  previously used `currentWindow`, which a service worker can only resolve to the
  last focused window.
- "Close other tabs" now spares grouped tabs as well as pinned ones, so a tab
  group is no longer wiped out whole. This diverges from Chrome's built-in
  command, which closes them. No new permission is needed: `Tab.groupId` is
  readable without the `tabGroups` permission.

### Changed

- The default duplicate shortcut moved from `Ctrl+Shift+D` / `Command+Shift+D` to
  `Alt+Shift+D`. The old default collided with Chrome's built-in *Bookmark all
  tabs*. Shortcuts customized in `chrome://extensions/shortcuts` are unaffected.
- Duplicating via keyboard uses the tab Chrome passes to the command listener
  instead of querying for it, removing an API round trip per keypress.
- `minimum_chrome_version` lowered from 120 to 102 to match the APIs actually used.
- The store description now mentions both features.

### Added

- A welcome page, shown once, documenting both shortcuts and how to assign
  `Ctrl+D` for duplication if you would rather have that than bookmarking. It
  reads the live bindings from `chrome.commands.getAll()`, so it shows the keys
  actually in effect and flags any shortcut Chrome failed to assign.
- Russian localisation, and `_locales` message catalogues behind everything
  user-visible: the store listing, the toolbar tooltip, the shortcut labels in
  `chrome://extensions/shortcuts`, and the welcome page.
- ESLint, type checking of JSDoc annotations against `@types/chrome`, and a CI
  workflow running both.

## 2.0.0

- Switch to Manifest V3.

## 1.2.0

- Remove the `tabs` permission.

## 1.1.0

- Add the `close-other-tabs-shortcut` command.

## 1.0.0

- Initial release.
