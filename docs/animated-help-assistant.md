# Animated website help assistant

Feature branch: `feature/animated-help-assistant`. This is a website component, not a ChatGPT pet, AI chatbot or live staff channel.

Abena is a small original illustrated Ghanaian woman inspired by the supplied fashion reference: full afro, white blouse, pink sash and a colourful Ghanaian-print skirt. She peeks in, plays with floating shapes, briefly sulks after inactivity, then rests. A click produces an excited jump and opens the topic menu. Closing produces a wave. Idle expressions do not repeatedly interrupt visitors. Reduced-motion preferences disable animation; Hide replaces the character with a small Help control. Only that hide preference is stored in browser session storage.

Topics cover company information, branches, loan guidance, account-opening availability, contact details and FAQs. The menu uses existing public routes and contact details. Typed questions are matched locally to predefined replies. They are not transmitted, logged or retained outside page memory. The assistant does not create customer records, approve loans or call an AI service. Account-opening guidance states that the online form is unavailable.

The assistant is excluded from staff-management and invitation routes. Keyboard users can open it, choose topics, follow links, return to the menu and close with Escape. This is a nonmodal help panel: the rest of the website remains available.

Implementation: `src/components/HelpAssistant.jsx` and `HelpAssistant.css`, mounted once in `src/App.jsx`. Update menu answers in the `topics` array and typed-question replies in `src/content/helpReplies.js` after business approval; do not add sensitive financial/account details to it.

Verification: `npx.cmd playwright test tests/e2e/help-assistant.spec.js` covers desktop/mobile interaction, focus, navigation, hide/restore, staff exclusions, idle states and reduced motion. Production build must also pass before release. No deployment or main-branch merge is performed by building this feature.

## Character asset

`public/assets/assistant/abena-poses.png` was generated with the built-in image-generation tool, using the supplied image as a design reference rather than an image to publish. The transparent two-by-two sprite sheet provides playful, sulky, excited and resting poses. CSS selects a pose and animates the character; display size is 84 px on desktop and 72 px on mobile.

Generation brief: original friendly stylised Ghanaian adult woman named Abena, voluminous afro, dark brown skin, white asymmetrical puff-sleeve blouse, pink sash, teal/gold/orange/navy Ghanaian wax-print skirt and gold earrings. Four equal-grid, transparent, full-body poses: seated playing, seated pouting, standing excited greeting, seated resting. Consistent costume and silhouette; no text, brand marks or reference background.

## Motion refinement

Pose changes crossfade over 650 ms while CSS adds anticipation, weight shifts, settling, breathing and a cushioned jump. These improve the four-pose artwork; they are not a rigged character and do not interpolate individual joints. The hide control sits below and beside the greeting. Pointer clicks/taps outside the assistant dismiss its panel without stealing focus from the selected page control. Reduced-motion removes transitions and the outgoing pose layer.

## Prepared replies and assistance

The user supplied WhatsApp number +1 (555) 478-4866; the clean handoff link is `https://wa.me/15554784866`. The link carries no question or conversation history. WhatsApp opens separately. Phone assistance uses the existing public support number 030 395 5183. Missing/unrecognised information receives an explicit unavailable response and offers WhatsApp or contact assistance. Greetings and basic social phrases have prepared replies. Matching is rule-based rather than general natural-language understanding. No AI subscription, backend or API key is needed for these replies.

## Messenger interface

Abena now uses an in-page conversation with left/right message bubbles, miniature portraits and a pinned composer/header. The transcript is limited to 40 messages in memory and is cleared by New chat, page refresh or entering a staff route. Page navigation closes the panel but preserves the current conversation within the running app. No chat content is transmitted or put in persistent storage.

Quick questions use the same prepared-reply flow as typed questions. They step aside while typing or preparing a reply and can return after 12 seconds of inactivity without changing the draft. A 1.5-2.1 second presentation delay shows miniature Abena and a thought bubble; it does not represent an AI/network operation. One reply is prepared at a time. Supported short follow-ups reuse the last known topic; unknown information stays explicitly unavailable. Greeting/acknowledgement variations change phrasing, not company facts. A New chat control cancels pending presentation and resets context. WhatsApp opens a separate conversation without forwarding this transcript.
