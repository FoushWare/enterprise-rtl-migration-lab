# Before / After ownership

Before = untouched Phase 2A originals. After = recreated representative Stage 09, not an original historical capture or necessarily the exact fixing commit.

## RTL-01 — Sidebar anchor, gutter, active border and mobile motion

Root cause: Physical edges and coupled gutter

Fix: Logical coupled geometry and direction-specific protected mobile translation

[Fixing commit](https://github.com/FoushWare/enterprise-rtl-migration-lab/commit/f96853b93e7ad8d49a5e4a6578b9ca5817ca07bd) · [Before](../../screenshots/phase-2a/overview-desktop-ar.png) · [After](../stage-09/invoicing-overview-ar.png)

historical issue + fixing diff + later-state capture; focused test receipts linked, not rerun by this collection. Full frames are evidence, not a new pixel-diff claim. Some mixed-script cases require regression fixtures beyond original seed data.

## RTL-02 — Revenue chronology

Root cause: Inherited direction reversed month flex chronology

Fix: LTR plot island; Arabic label isolation; SVG and data order preserved

[Fixing commit](https://github.com/FoushWare/enterprise-rtl-migration-lab/commit/9d19db88780a799576cec444f01607197b0751e6) · [Before](../../screenshots/phase-2a/overview-desktop-ar.png) · [After](../stage-09/invoicing-overview-ar.png)

historical issue + fixing diff + later-state capture; focused test receipts linked, not rerun by this collection. Full frames are evidence, not a new pixel-diff claim. Some mixed-script cases require regression fixtures beyond original seed data.

## RTL-03 — KPI icon/label clearance

Root cause: Physical right icon collided with Arabic text

Fix: inset-inline-end replaces physical right; card dimensions unchanged

[Fixing commit](https://github.com/FoushWare/enterprise-rtl-migration-lab/commit/33b3fac694c19a2a3bfae3b980db6a5beea62bbc) · [Before](../../screenshots/phase-2a/overview-desktop-ar.png) · [After](../stage-09/invoicing-overview-ar.png)

historical issue + fixing diff + later-state capture; focused test receipts linked, not rerun by this collection. Full frames are evidence, not a new pixel-diff claim. Some mixed-script cases require regression fixtures beyond original seed data.

## RTL-09 — Latin brand composition

Root cause: Brand flex composition inherited RTL

Fix: Complete brand direction island; mark not mirrored

[Fixing commit](https://github.com/FoushWare/enterprise-rtl-migration-lab/commit/da6c6b9aca3d4febb83444f8bfa37fb0181b0106) · [Before](../../screenshots/phase-2a/overview-desktop-ar.png) · [After](../stage-09/invoicing-overview-ar.png)

historical issue + fixing diff + later-state capture; focused test receipts linked, not rerun by this collection. Full frames are evidence, not a new pixel-diff claim. Some mixed-script cases require regression fixtures beyond original seed data.

## RTL-07 — Invoice progression icon

Root cause: ArrowForward selected in both locales

Fix: ArrowBack in Arabic using existing locale; same route/name

[Fixing commit](https://github.com/FoushWare/enterprise-rtl-migration-lab/commit/6adfee997347472dcf7e854cf35daba2db28c8ef) · [Before](../../screenshots/phase-2a/invoices-desktop-ar.png) · [After](../stage-09/invoicing-invoices-ar.png)

historical issue + fixing diff + later-state capture; focused test receipts linked, not rerun by this collection. Full frames are evidence, not a new pixel-diff claim. Some mixed-script cases require regression fixtures beyond original seed data.

## RTL-07 — Shared Sidebar progression

Root cause: Cross-app icon remained right-facing

Fix: Scoped RTL CSS mirror; pinned TSX unchanged

[Fixing commit](https://github.com/FoushWare/enterprise-rtl-migration-lab/commit/8041f4c9c4411adb0247c3061727086c9d0735b7) · [Before](../../screenshots/phase-2a/overview-desktop-ar.png) · [After](../stage-09/invoicing-overview-ar.png)

historical issue + fixing diff + later-state capture; focused test receipts linked, not rerun by this collection. Full frames are evidence, not a new pixel-diff claim. Some mixed-script cases require regression fixtures beyond original seed data.

## RTL-07 — Dashboard progression glyph

Root cause: Literal right arrow in Arabic navigation copy

Fix: Localized progression glyph; financial arrows preserved

[Fixing commit](https://github.com/FoushWare/enterprise-rtl-migration-lab/commit/4e966e92e1ae948f7f8937840758771dbcaa5499) · [Before](../../screenshots/phase-2a/overview-desktop-ar.png) · [After](../stage-09/invoicing-overview-ar.png)

historical issue + fixing diff + later-state capture; focused test receipts linked, not rerun by this collection. Full frames are evidence, not a new pixel-diff claim. Some mixed-script cases require regression fixtures beyond original seed data.

## RTL-08 — Customer addresses and mixed names

Root cause: Unisolated mixed tokens/punctuation

Fix: Semantic bdi boundaries; canonical text unchanged

[Fixing commit](https://github.com/FoushWare/enterprise-rtl-migration-lab/commit/767e70f525dac6e3a12aa6eb827fdcc73e498da7) · [Before](../../screenshots/phase-2a/customer-dialog-desktop-ar.png) · [After](../stage-09/invoicing-customer-dialog-ar.png)

partial visual correlation: exact fixing source and historical regression receipts; original seed images do not reproduce every tested mixed-script defect. Full frames are evidence, not a new pixel-diff claim. Some mixed-script cases require regression fixtures beyond original seed data.

## RTL-08 — Financial values and mixed tokens

Root cause: Currency/name boundaries inherited ambient bidi context

Fix: Scoped numeric/title islands and token isolation; en-US formatting retained

[Fixing commit](https://github.com/FoushWare/enterprise-rtl-migration-lab/commit/767e70f525dac6e3a12aa6eb827fdcc73e498da7) · [Before](../../screenshots/phase-2a/create-desktop-ar.png) · [After](../stage-09/invoicing-create-ar.png)

partial visual correlation: exact fixing source and historical regression receipts; original seed images do not reproduce every tested mixed-script defect. Full frames are evidence, not a new pixel-diff claim. Some mixed-script cases require regression fixtures beyond original seed data.
