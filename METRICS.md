# Product metrics

Events:

- `visited`: product loaded
- `routes_built`: a saved avatar or search condition produced route cards
- `booth_opened`: a BOOTH search link was opened
- `avatar_saved`: an avatar name was added to the local rack
- `returned`: the same browser returned after at least 20 hours

The event schema accepts exactly one `event` field. Avatar names, categories, modifiers, generated URLs, and BOOTH results are never sent.

## Early signal

- At least 5 distinct browsers build routes.
- At least 2 distinct browsers open BOOTH.

These are interaction signals, not the final validation result.
