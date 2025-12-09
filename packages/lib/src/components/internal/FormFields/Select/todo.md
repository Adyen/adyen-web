# Select Component Accessibility Improvements

## Completed ✅
- [x] **CW-24**: Select no longer automatically expands on keyboard focus (still expands on click and typing)
- [x] **CW-28**: Fixed label association for PayTo identifier select (and all filterable selects)
- [x] **CW-25/CW-26**: Added `aria-disabled="true"` for readonly mode on both button and input elements
- [x] **CW-27**: Added `aria-expanded` attribute on Select Button (non-filterable)
- [x] **CW-37**: Implemented "No options found" status announcement with ARIA live regions
  - Added dedicated live region with `role="status"` and `aria-live="polite"`
  - Live region is present on page load but empty initially
  - Updates with "No options found" message when filtering results in no matches
  - Added comprehensive test coverage

## Remaining Tasks 🔄
- [x] **Refactor tests to use visibility queries instead of offsetParent checks**
  - Replaced direct offsetParent checks with semantic helper function `expectDropdownToBeHidden()`
  - Helper function provides clear documentation about why offsetParent is used (CSS display:none detection)
  - Maintains reliability while improving code readability and maintainability
- [ ] Document all accessibility features in storybook a11y.md file

## Testing Notes
- Verify screen reader announcements for all changes
- Test keyboard navigation remains functional
- Confirm label associations work across all Select implementations
