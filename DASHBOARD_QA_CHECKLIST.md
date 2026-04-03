# Dashboard QA Checklist

## Primary Flows

- [ ] Root route redirects to `/dashboard`.
- [ ] Left sidebar is visible on desktop and active item is highlighted.
- [ ] Topbar shows the current month id and quick actions.
- [ ] Mobile top navigation appears and is horizontally scrollable.

## Monthly Flow

- [ ] Switching month with `Previous` and `Next` updates selector and cards.
- [ ] Month selector (`type=month`) updates displayed month data.
- [ ] Save button is disabled for invalid values.
- [ ] Save button shows loading label while saving.
- [ ] Empty state appears when selected month has no values.

## Current Month

- [ ] `Add income` button disables while request is in flight.
- [ ] `Add expense` button disables while request is in flight.
- [ ] `Save` and `Withdraw` buttons disable while request is in flight.
- [ ] Button labels show action-specific loading text.
- [ ] Optimistic values appear briefly during action submission.
- [ ] Validation message appears for zero/invalid action amounts.

## Savings

- [ ] Total savings card reflects current data and selected currency.
- [ ] Empty state appears when no savings activity exists.
- [ ] Activity table shows save/withdraw rows with month labels.

## Profile

- [ ] Profile fields display current authenticated user details.
- [ ] Logout button shows loading state and disables during sign-out.

## Settings

- [ ] Currency select updates global UI currency formatting.
- [ ] Currency select disables while saving.
- [ ] Theme buttons disable while saving.
- [ ] Theme and currency rollback correctly on failed save.

## Responsive / UX

- [ ] Loading skeleton appears while session is loading.
- [ ] Cards preserve spacing and readability on small screens.
- [ ] Table remains usable on mobile via horizontal scroll.
- [ ] No overlapping controls in topbar/sidebar on any breakpoint.
