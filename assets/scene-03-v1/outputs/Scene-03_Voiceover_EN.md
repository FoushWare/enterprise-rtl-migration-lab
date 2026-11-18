# Scene03 Voiceover EN

Draft – Pending Review. Natural-delivery estimates, not recorded word timings. No synthetic voice. Twelve-shot order preserved.

|Shot|Start–End|Estimated speech|Exact narration sentence|
|---|---|---|---|
|03-01|0.30–9.70s|6.3s|Let’s look under the hood. Before changing code, identify the main components and who owns each responsibility.|
|03-02|10.30–19.70s|6.7s|This Nx monorepo contains two applications, shared libraries, and tools. Separate application logic, shared presentation, and source analysis.|
|03-03|20.30–34.70s|10.4s|Invoicing manages invoices, with its own entry point, routes, list, and detail pages. Procurement manages purchase orders through its own entry and routes. Both applications use shared libraries.|
|03-04|35.30–44.70s|8.5s|This is the real Invoicing App. The router selects pages; App owns invoice state and passes it to the pages that need it.|
|03-05|45.30–54.70s|6.7s|The Design System supplies the shell, fields, tables, and dialogs. One shared component can therefore affect both applications.|
|03-06|55.30–64.70s|7.0s|Shared contains business types, fixtures, totals, money formatting, and local storage. It also exports the locale and translation interface.|
|03-07|65.30–74.70s|8.5s|Locale, document direction, styling, and icon meaning are separate. Study uses document RTL and MUI LTR; icons require semantic review, not automatic mirroring.|
|03-08|75.30–84.70s|8.1s|The Scanner collects static evidence and potential risks. The Codemod constrains changes through safety checks; a finding is not automatic repair approval.|
|03-09|85.30–99.70s|8.1s|These relationships come from actual imports. Both applications use Design System and Shared. Tools analyze source files; neither application imports the other.|
|03-10|100.30–114.70s|8.5s|Our real example is invoice1048: Northstar Studio, four thousand eight hundred US dollars, Pending. The actual table link opens the same invoice details.|
|03-11|115.30–124.70s|8.1s|A symptom may appear in an application while its owner is a shared component or runtime layer. Establish causality before changing code.|
|03-12|125.30–129.70s|3.3s|How do we find RTL risks across this codebase?|