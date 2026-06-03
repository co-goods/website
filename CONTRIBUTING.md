# Contributing to the Co-Goods website

Thank you for your interest in contributing! Co-Goods is an open-innovation
research initiative — see [cogoods.org](https://cogoods.org). This repository is
the **website**: the application code and the site-composition content (pages and
overlays).

> **Contributing research or content?** Wiki articles, essays, glossary items,
> library entries, and research live in the **content repo**, not here — see
> [cogoods.org/contributing](https://cogoods.org/contributing) (or the
> [content repo](https://github.com/co-goods/content)'s `CONTRIBUTING.md`).

## Code of Conduct

By participating you agree to follow our Code of Conduct (being finalized in the
org [`.github`](https://github.com/co-goods/.github) repo).

## Areas of contribution

- **Code** — bug fixes, features, performance, accessibility, tests, refactors.
- **Site content** — composed pages in `pages/` (e.g. home, about) and
  site-specific section splices in `overlays/`.
- **Bug reports & feature suggestions** — via GitHub issues.

## How to contribute

1. **Fork** and **clone** your fork (the site mounts two submodules — content and
   the design system):
   ```bash
   git clone --recurse-submodules https://github.com/your-username/website.git
   cd website
   npm install
   npm run dev
   ```
2. **Create a branch** (`feature/…`, `fix/…`, `docs/…`).
3. **Make your change** and check it locally (`npm run dev`, `npm run build`).
4. **Open a pull request** to `staging`; describe the change and link any related
   discussion.
5. A maintainer reviews and merges.

### Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/).

## Licensing

**Your contribution's license (outbound).** **Code → [MIT](./LICENSE)**;
**site content** (`pages/`, `overlays/`) → **CC-BY-SA-4.0**. You keep your
copyright.

**What we can accept (inbound).** Code under MIT (or a compatible permissive
license); site content under **CC-BY-SA-4.0 or a more-permissive, compatible**
license (`CC-BY-4.0`, `CC0-1.0`) — no NonCommercial (NC) or NoDerivatives (ND).

**Overriding per item.** A site-content file can set its own `license:` in its
YAML frontmatter using an **SPDX identifier** (e.g. `CC-BY-4.0`); it must still be
compatible.

**Things you bring with you (inherited / third-party).** Code dependencies keep
their own licenses — add only ones compatible with MIT. Media and assets keep
*their own* license — set `credit` and `license` on the `image` / `video` block
and make sure the terms permit the use.

**Multiple authors.** Credit everyone involved. Ideas developed collaboratively —
in discussions, working sessions, events, on Discord, or anywhere else — are fine
to synthesize and credit. If you reuse someone's substantial **wording or code**,
they must also be a covered contributor.

## Contributor License Agreement

Contributing requires agreeing to our **Contributor License Agreement** (current:
[`cla-v1`](https://github.com/co-goods/.github/blob/main/cla/cla-v1.md)). You keep
your copyright; you grant a broad, sublicensable, assignable license so the work
can stay open and, if needed, move to a future neutral entity. It's deliberately
broad while we're small — we expect to relax it in a later version; if a term is a
dealbreaker, please reach out, it's a matter of priorities, not principle.

**Signing:** add your name and the CLA version to
[`CLA-SIGNATURES.md`](https://github.com/co-goods/.github/blob/main/CLA-SIGNATURES.md)
in your pull request. (We'll automate this with cla-assistant as we grow.)

## Developer Certificate of Origin

Some projects use a [DCO](https://developercertificate.org) sign-off
(`git commit -s`). We rely on the CLA above, which already covers provenance, so
**no sign-off is required here** — we mention it only because you may recognize it
from other projects.

## Community

- **Discord** — join us for discussion and questions.
- **GitHub** — issues for bugs / requests; PR threads for change-specific discussion.

## Recognition

Contributors are credited in release notes and the project's contributors list.
Thank you! 🎉
