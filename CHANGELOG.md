# Changelog

All notable changes to this project will be documented in this file.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-05-09

### Added
- Light and dark theme with a one-click toggle in the header.
- Initial theme follows the OS `prefers-color-scheme` setting and tracks it
  while the user has not made an explicit choice; the chosen theme is then
  persisted in `localStorage` and synced across pages and tabs.
- Smooth color/border transitions when toggling themes across both the docs
  and playground screens.

### Fixed
- Theme is now re-applied when a page is restored from the browser's
  back/forward cache, so navigating back from the playground no longer leaves
  the previous page on the stale theme until reload.
