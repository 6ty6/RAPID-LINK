// Reveal the unchanged approved bitmap through hand-traced pen paths.
// The embedded image keeps the animated SVG self-contained during startup.
import { readFileSync, writeFileSync } from 'node:fs'
const logo = readFileSync(new URL('../public/assets/rapidlink-logo.png', import.meta.url)).toString('base64')
const paths = {
  arch: 'M64 226 C140 24 539 8 657 219 M653 209 L665 225 L678 217 L673 235 L681 247 L661 240 L649 247 L652 229 L640 221 L653 219',
  name: 'M153 334 L153 239 L178 239 C220 232 223 286 180 288 L158 288 M180 286 L218 332 M255 286 C317 263 322 323 318 333 M304 308 C251 291 250 343 305 326 M359 362 L359 282 M368 291 C428 263 431 336 376 326 M461 281 L461 331 M460 240 L462 240 M564 237 L564 333 M550 286 C496 279 491 343 550 328 M610 238 L610 331 M664 282 L664 331 M716 282 L716 330 M728 289 C773 267 778 291 776 331 M819 238 L819 332 M869 283 L831 306 L878 333',
  rule: 'M348 370 L900 370',
  detail: 'M362 438 L362 409 Q382 391 386 411 L386 439 M386 410 Q411 390 412 414 L412 439 M439 409 L439 439 M438 389 L440 389 M485 410 C454 391 451 451 485 433 M508 439 L508 409 Q525 399 532 412 M556 409 C526 407 531 442 556 435 C580 443 583 403 556 409 M608 439 L608 395 Q612 377 626 390 M592 408 L626 408 M645 408 L645 439 M644 389 L646 389 M671 439 L671 409 Q698 395 698 416 L698 439 M716 410 Q754 394 751 439 M743 420 C709 411 710 444 741 431 M774 439 L774 409 Q802 395 802 416 L802 439 M839 411 C806 392 806 451 839 433 M859 421 L888 421 C890 396 849 397 851 422 C851 443 879 442 888 431',
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 520" role="img" aria-label="RapidLink Microfinance">
<style>
path{fill:none;stroke:white;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;animation-duration:2.4s;animation-iteration-count:infinite;animation-timing-function:cubic-bezier(.45,0,.55,1)}
.arch{stroke-width:72;animation-name:arch;clip-path:url(#arch-area)}.name{stroke-width:60;animation-name:name}.rule{stroke-width:12;animation-name:rule}.detail{stroke-width:36;animation-name:detail}
@keyframes arch{0%{stroke-dashoffset:1}10%,90%{stroke-dashoffset:0}100%{stroke-dashoffset:1}}
@keyframes name{0%,10%{stroke-dashoffset:1}35%,65%{stroke-dashoffset:0}90%,100%{stroke-dashoffset:1}}
@keyframes rule{0%,35%{stroke-dashoffset:1}39%,61%{stroke-dashoffset:0}65%,100%{stroke-dashoffset:1}}
@keyframes detail{0%,39%{stroke-dashoffset:1}47%,53%{stroke-dashoffset:0}61%,100%{stroke-dashoffset:1}}
@media(prefers-reduced-motion:reduce){path{animation:none;stroke-dashoffset:0}}
</style><defs><clipPath id="arch-area"><path d="M0 0H1080V220H700V254H635V220H0Z" style="fill:white;stroke:none;animation:none"/></clipPath><mask id="pen" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="520">${Object.entries(paths).map(([name,d])=>`<path class="${name}" d="${d}" pathLength="1"/>`).join('')}</mask></defs>
<image width="1080" height="520" href="data:image/png;base64,${logo}" mask="url(#pen)"/>
</svg>`
writeFileSync(new URL('../public/assets/rapidlink-loader.svg', import.meta.url), svg)
