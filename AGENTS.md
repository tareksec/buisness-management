<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- All sample data lives in `src/data/mock.ts` and all data shapes in `src/types.ts`; screens import only these, so a real API can replace mock.ts without touching screens.
- Every UI string must exist in both `src/i18n/en.json` and `src/i18n/bn.json` — the app is fully bilingual.
- Different currencies are never summed; multi-business views list one row per business.

- Inner screens use shared illustrated overview and detail-sheet primitives; keep action state in the route body so opening details does not reset edits.
- Render funded jars and adjustable coin stacks as data-driven SVG over scene artwork so funding levels and what-if shares reflect the selected project.
