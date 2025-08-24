const HIDE_CSS = `
ytd-ad-slot-renderer,
ytd-in-feed-ad-layout-renderer,
ytd-display-ad-renderer,
ytd-banner-promo-renderer,
#masthead-ad,
.video-ads,
.ytp-ad-progress,
.ytp-ad-image-overlay,
.ytp-ad-overlay-container,
.ytp-ad-player-overlay,
.ytd-promoted-sparkles-web-renderer,
.ytd-companion-slot-renderer {
display: none !important;
visibility: hidden !important;
opacity: 0 !important;
height: 0 !important;
width: 0 !important;
}
`;


let fastForwardEnabled = true;


// Load user setting from options
chrome.storage.sync.get(['fastForward'], result => {
fastForwardEnabled = result.fastForward ?? true;
});


chrome.storage.onChanged.addListener(changes => {
if (changes.fastForward) {
fastForwardEnabled = changes.fastForward.newValue;
}
});


function injectCSS() {
const id = "ltab-style";
if (!document.getElementById(id)) {
const style = document.createElement("style");
style.id = id;
style.textContent = HIDE_CSS;
document.documentElement.appendChild(style);
}
}


function clickIfExists(selector) {
const el = document.querySelector(selector);
if (el) el.click();
}


function getPlayer() {
return document.querySelector('video.html5-main-video');
}

let restore = { rate: 1, muted: false };
let speeding = false;


function handleAdState() {
const player = getPlayer();
const adShowing = document.querySelector('.ad-showing, .ytp-ad-player-overlay') !== null;


// Skip/close buttons
clickIfExists('.ytp-ad-skip-button');
clickIfExists('.ytp-ad-skip-button-modern');
document.querySelectorAll('.ytp-ad-overlay-close-button').forEach(btn => btn.click());


if (!player) return;


if (adShowing) {
if (fastForwardEnabled && !speeding) {
restore.rate = player.playbackRate || 1;
restore.muted = player.muted;
player.playbackRate = 16;
player.muted = true;
speeding = true;
} else if (!fastForwardEnabled) {
player.muted = true;
}
} else if (speeding) {
player.playbackRate = restore.rate;
player.muted = restore.muted;
speeding = false;
}
}


const observer = new MutationObserver(() => {
injectCSS();
handleAdState();
});


function start() {
injectCSS();
handleAdState();


const target = document.body || document.documentElement;
observer.observe(target, { childList: true, subtree: true, attributes: true });
setInterval(handleAdState, 800);
}


if (document.readyState === 'complete' || document.readyState === 'interactive') {
start();
} else {
window.addEventListener('DOMContentLoaded', start, { once: true });
}
