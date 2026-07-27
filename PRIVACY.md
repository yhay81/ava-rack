# Privacy design

- Avatar names, categories, modifiers, and sort order remain in browser `localStorage`.
- BOOTH search URLs are generated in browser JavaScript.
- D1 stores only allowlisted event names, timestamps, and SHA-256 hashes of random client UUIDs.
- IP addresses, user agents, avatar names, categories, generated URLs, and search results are not inserted into D1.
- Events are deleted after 35 days.
- No advertising or third-party analytics SDK is used.
