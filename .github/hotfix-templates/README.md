# Hotfix release templates

Notices that the **Flag Affected Release** workflow (`.github/workflows/flag-affected-release.yml`) adds to GitHub releases during a hotfix. The workflow fills them in with `.github/scripts/hotfix-notice.js`. You can also fill them in by hand if the workflow is unavailable.

| Template | Added to | When |
| --- | --- | --- |
| `affected-release-fix-pending.md` | The broken release | As soon as the bug is confirmed, before the patch exists |
| `affected-release-fixed.md` | The broken release (replaces the notice above) | After the patch release is published |
| `hotfix-release-note.md` | The patch release | After the patch release is published |

Placeholders:

| Placeholder | Meaning |
| --- | --- |
| `${SUMMARY}` | One or two customer-facing sentences describing the impact. **This text is public.** |
| `${AFFECTED_VERSION}`, `${AFFECTED_RELEASE_URL}` | The broken version and its GitHub release |
| `${FIXED_VERSION}`, `${FIXED_RELEASE_URL}` | The patch version and its GitHub release |
| `${RECOMMENDATION}` | What to do until the fix ships, e.g. "Until it is available, use v6.46.0." |
| `${DETAILS}` | Optional link to a public GitHub issue; empty otherwise |

Each notice is wrapped in HTML comment markers (`<!-- hotfix-warning:start -->` / `:end -->`). The workflow replaces the marked block instead of adding a second copy, so re-running it is safe. Keep the markers if you edit a release by hand.

Never put internal links (Slack, internal GitLab) in these notices. adyen-web is a public repository.
