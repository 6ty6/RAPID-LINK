# PDF preview dependency assessment

**Date:** 10 November 2026  
**Scope:** Controller loan-rate guide only

## Current implementation

The website uses `pdfjs-dist` only after a customer selects **View document** on
the rate-guide page. The PDF library and its worker are dynamically imported;
they are not part of the initial page JavaScript requested by ordinary visitors.
The preview dialogue also provides a separate direct Download link.

The production build reports these deferred assets:

- PDF rendering module: approximately 501 KB before compression;
- PDF worker: approximately 1.27 MB; and
- main application JavaScript: approximately 313 KB before compression.

The final mobile Lighthouse evidence scored Performance 99 with this lazy-load
design, so PDF.js is not currently harming the measured initial homepage load.

## Direct-link alternative

A direct link with `target="_blank"` is much simpler and removes the PDF module
and worker. It depends on all of the following:

- the host returning `Content-Type: application/pdf`;
- the host not forcing `Content-Disposition: attachment`;
- the customer's browser having an enabled PDF viewer; and
- the customer's browser settings not forcing all PDFs to download.

The project previously experienced automatic downloads instead of an in-page
preview. A direct link therefore cannot guarantee the requested “view before
downloading” experience for every customer.

## Recommendation

Retain the current lazy-loaded PDF.js preview for the present controller guide.
It satisfies the confirmed preview requirement and does not reduce the current
initial Lighthouse performance score. Do not expand it into a general document
management system.

Reconsider removal only after the final host is configured and the direct PDF
response has been tested in current Chrome, Edge, Firefox, Safari and at least
one mobile browser. If RapidLink accepts that some browser settings may download
the document automatically, replace the preview with a normal new-tab link and
retain a clearly labelled Download action.
