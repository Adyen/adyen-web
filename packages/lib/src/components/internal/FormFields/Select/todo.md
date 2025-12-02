# Select Component Accessibility Improvements

## Completed ✅
- [x] **CW-24**: Select no longer automatically expands on keyboard focus (still expands on click and typing)
- [x] **CW-28**: Fixed label association for PayTo identifier select (and all filterable selects)
- [x] **CW-25/CW-26**: Added `aria-disabled="true"` for readonly mode on both button and input elements
- [x] **CW-27**: Added `aria-expanded` attribute on Select Button (non-filterable)

## Remaining Tasks 🔄
- [ ] **CW-37**: Implement "No options found" status announcement with ARIA live regions
  - Test adding `role="status"` to the no-options div
  - If that doesn't work, consider making it an unselectable option
  - Ensure live region is present on page load but empty initially
- [ ] Refactor tests to use visibility queries instead of offsetParent checks
- [ ] Document all accessibility features in storybook a11y.md file

## Testing Notes
- Verify screen reader announcements for all changes
- Test keyboard navigation remains functional
- Confirm label associations work across all Select implementations
