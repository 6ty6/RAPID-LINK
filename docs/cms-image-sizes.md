# CMS image upload sizes

Checked 25 November 2026 against the current website styles and source artwork. Dimensions below are **recommended source/upload sizes in pixels, width × height**. They are not fixed browser display sizes: the site resizes images for the screen, and some frames crop their edges.

Every CMS image field now shows its recommended dimensions, intended placement, crop guidance and the selected image's actual dimensions. Actual dimensions come from the Sanity image asset reference, so no extra API request is needed. Existing artwork remains usable; these recommendations do not add a publishing restriction or resize an uploaded file.

| CMS image field / placement | Recommended upload | Shape | Display behavior |
| --- | --- | --- | --- |
| Homepage flyer slider | 1920 × 700 | Approximately 2.74:1 | Whole flyer shown; natural image height. Keep all slides the same wide shape and make printed text readable on mobile. |
| Homepage Current Interest Rates card | 1500 × 1000 | 3:2 | Cropped into the card; main subject toward the right. |
| Homepage Loan Calculator card | 1500 × 1000 | 3:2 | Cropped into the card; text overlays the left. |
| Product page top banner | 1920 × 800 | 12:5 | Cropped in the right-hand banner panel. |
| Product detail/homepage image: Personal Loans, Business Loans, Rapid Susu, Rapid Edu-Grow, Fixed Deposit | 1500 × 1000 | 3:2 | Same source supplies both places. Business Loans fits the complete landscape image on its detail page; other detail frames can crop. Homepage cards crop to fill. |
| Product detail/homepage image: Rapid Savings, Rapid Target Savings, Advantage Investment, Group Loans, Deduction at Source; default for new products | 1200 × 1500 | 4:5 | Suits the taller detail frame; homepage cards crop the same image. Keep faces in the upper-middle and leave room around the subject. |
| Institutional Profile banner | 2160 × 720 | 3:1 | Main artwork/crowd on the right; clear light area on the left for the live heading and introduction. |
| Board of Directors banner | 2160 × 720 | 3:1 | Wide background; edges crop on smaller screens. |
| Director portrait | 1000 × 1250 | 4:5 | Fits inside the square board card; biography portrait uses a 4:5 crop. Keep head/face centred near the top. |
| News page banner | 2160 × 720 | 3:1 | Wide background with responsive cropping. |
| Contact page banner | 2160 × 720 | 3:1 | Wide banner source with responsive cropping. |
| Careers page banner | 2000 × 500 | 4:1 | Panoramic; sides crop on mobile. |
| FAQ page banner | 1920 × 960 | 2:1 | Cropped in the right-hand banner panel. |
| Current Interest Rates page banner | 1920 × 960 | 2:1 | Cropped in the right-hand banner panel. |
| Rates-guide page banner | 1920 × 960 | 2:1 | Cropped in the right-hand banner panel. |
| Loan Calculator page banner | 2160 × 720 | 3:1 | Wide source; keep subject/details away from edges. |
| Digital Channels banner | 1920 × 700 | Approximately 2.74:1 | Fills a fixed-height area; can crop on mobile. Keep essential content central. |
| Digital Channels mobile-app/USSD card artwork | 1000 × 1200 | 5:6 | Whole image fitted inside the card; no crop. Avoid unnecessary internal margins. |
| Digital Channels merchant artwork/MoneyQube logo | 1200 × 800 | 3:2 | Whole image fitted inside the card; no crop. Keep merchant numbers large and centred. |
| Shared mobile-app download promotion | 1200 × 800 | 3:2 | Artwork is intentionally cropped in a shallow display frame. Keep phone screens grouped centrally. |
| News article image | 1600 × 900 | 16:9 | Shared by article, newsroom and homepage. Newsroom/article frames crop; homepage fits the full image. |

## Preparing an upload

- Keep important faces, logos and product details away from the edges. Changing the pixel dimensions alone cannot prevent cropping when a photograph is reused in different frames.
- Use WebP or JPG for photographs; PNG or WebP for transparent artwork. Optimise file size without blurring faces, merchant IDs or flyer text.
- Do not stretch a small image to meet the recommendation; obtain a larger original where possible.
- Keep page titles and descriptions as CMS text rather than printing them into banner images. Promotional flyers and verified merchant artwork can contain their approved text, but it must stay readable at mobile width.
- Check the page on a phone after publishing. The size guidance explains current website positioning; choosing Sanity's crop/hotspot controls does not change every website frame because some have fixed CSS positioning.
- Website logos, Abena's animation sprites and decorative interface icons currently remain code-managed assets, not CMS upload fields. The document library accepts files separately and does not use these website-image recommendations.

The recommendations are defined in `cms/sanity/studio/imageGuidelines.js`. The current file inventory below records actual bundled dimensions, which can differ from the recommended sizes. It does not imply that a smaller existing image must be replaced or that an editor's newer Sanity upload has the same dimensions.

## Actual bundled image inventory

| File | Actual width × height |
| --- | --- |
| /assets/about-board-directors-v2.png | 2172 x 724 px |
| /assets/board-emmanuel-debrah.png | 577 x 590 px |
| /assets/board-edward-opare-donkor.png | 577 x 590 px |
| /assets/board-henrici-daniel-aboa.png | 577 x 590 px |
| /assets/about-us-community-v1.webp | 2172 x 724 px |
| /assets/rates-hero-v2.png | 1774 x 887 px |
| /assets/faq-hero-v3.png | 1774 x 887 px |
| /assets/news-hero-v3.png | 2172 x 724 px |
| /assets/about-careers.jpeg | 1400 x 350 px |
| /assets/contact-hero-v2.png | 2172 x 724 px |
| /assets/hero-controller.png | 2086 x 754 px |
| /assets/hero-notice.jpg | 1600 x 578 px |
| /assets/controller-loan-flyer.png | 1719 x 621 px |
| /assets/planning-current-rates.jpg | 1280 x 905 px |
| /assets/personal-loan-hero.png | 720 x 300 px |
| /assets/personal-loan-planning-v1.png | 1536 x 1024 px |
| /assets/group-loan-hero.webp | 600 x 172 px |
| /assets/group-loan-market-v1.png | 1122 x 1402 px |
| /assets/deduct-loan-hero.jpg | 1200 x 600 px |
| /assets/deduct-salary-nurse-v1.png | 1122 x 1402 px |
| /assets/business-loan-hero.png | 1719 x 621 px |
| /assets/business-loan-ghana-sme-v1.jpg | 1400 x 933 px |
| /assets/rapid-savings-hero.png | 720 x 300 px |
| /assets/rapid-savings-custom-v1.png | 1122 x 1402 px |
| /assets/rapid-susu-hero.png | 720 x 300 px |
| /assets/rapid-susu-growth-v1.png | 1536 x 1024 px |
| /assets/rapid-edu-grow-hero.png | 720 x 300 px |
| /assets/rapid-edu-grow.jpg | 612 x 408 px |
| /assets/rapid-target-savings-hero.webp | 600 x 253 px |
| /assets/rapid-target-home-v1.png | 1122 x 1402 px |
| /assets/fixed-deposit-hero-v2.png | 1774 x 887 px |
| /assets/fixed-deposit-term-v1.png | 1536 x 1024 px |
| /assets/advantage-investment-hero.jpg | 928 x 360 px |
| /assets/advantage-market-adviser-v1.png | 1122 x 1402 px |
| /assets/loan-calculator-hero-v2.png | 2172 x 724 px |
| /assets/planning-calculator-photo.jpg | 1920 x 1280 px |
| /assets/digital-channels-hero.png | 1719 x 621 px |
| /assets/digital-mobile-app.png | 462 x 564 px |
| /assets/digital-rapidpay-ussd.png | 466 x 568 px |
| /assets/digital-mtn-merchant.png | 434 x 288 px |
| /assets/digital-telecel-merchant.png | 430 x 292 px |
| /assets/digital-moneyqube.png | 601 x 415 px |
| /assets/rapidlink-mobile-app.png | 622 x 401 px |
