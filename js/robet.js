// Peeking robot greeter. Self-contained: injects its own CSS + SVG.
(function init() {
  if (!document.body) return document.addEventListener("DOMContentLoaded", init);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const messages = [
  "Hello! 👋 I'm Bit, Rinchen's profile bot. Welcome!",
  "Rinchen studies Computer System & Network at JNEC. Check the Education section!",
  "Curious about his work? The Projects section has a hospital network and a hall booking system.",
  "Want to say hello? Email and GitHub are in the Contact section. 📬",
  "Try the filters in Projects to sort work by Networking or Software.",
  "Fun fact: the network behind me is sending real (fake) packets. 📡",
  "Wangduephodrang, Bhutan is where Rinchen is from. 🇧🇹"
  ];

  const css = `

  #bot{position:fixed;right:0;bottom:24px;width:130px;z-index:9999;
    transform:translateX(110%);transition:transform .6s cubic-bezier(.2,.8,.2,1)}
  #bot.in{transform:translateX(42%)}
  #bot.in:hover,#bot.in:focus-within{transform:translateX(18%)}
  #bot-btn{all:unset;display:block;cursor:pointer;width:130px}
  #bot-btn:focus-visible{outline:2px solid var(--amber,#E2A53D);outline-offset:4px;border-radius:12px}
  #bot svg{display:block;width:100%;height:auto;overflow:visible}
  #bot .arm{transform-origin:32px 98px}
  #bot.waving .arm{animation:bot-wave .5s ease-in-out infinite alternate}
  @keyframes bot-wave{from{transform:rotate(30deg)}to{transform:rotate(70deg)}}
  #bot .arm{transform:rotate(0deg)}
  #bot .led{animation:bot-pulse 1.6s ease-in-out infinite}
  @keyframes bot-pulse{50%{opacity:.25}}
  #bot .eyes{animation:bot-blink 5s infinite;transform-origin:60px 51px}
  @keyframes bot-blink{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}
  #bot-say{position:absolute;right:100%;bottom:70px;margin-right:6px;width:max-content;max-width:210px;
    background:#161D25;color:#F6F8F9;border:1px solid #27A6A4;border-radius:10px;
    padding:10px 12px;font:500 .85rem/1.4 "IBM Plex Sans",sans-serif;
    opacity:0;transform:translateY(6px);transition:opacity .25s,transform .25s;pointer-events:none}
  #bot-say.show{opacity:1;transform:none}
  #bot-say::after{content:"";position:absolute;right:-6px;bottom:14px;width:10px;height:10px;
    background:#161D25;border-right:1px solid #27A6A4;border-top:1px solid #27A6A4;transform:rotate(45deg)}
  @media(max-width:640px){#bot{width:96px;bottom:12px}#bot-btn{width:96px}#bot-say{bottom:52px;max-width:170px;font-size:.8rem}}
  @media print{#bot{display:none}}`;

  const svg = `
  <svg viewBox="0 0 120 150" aria-hidden="true">
    <line x1="60" y1="10" x2="60" y2="26" stroke="#27A6A4" stroke-width="2"/>
    <circle class="led" cx="60" cy="8" r="4.5" fill="#E2A53D"/>
    <rect x="12" y="42" width="10" height="22" rx="4" fill="#27A6A4"/>
    <rect x="98" y="42" width="10" height="22" rx="4" fill="#27A6A4"/>
    <rect x="22" y="24" width="76" height="58" rx="14" fill="#161D25" stroke="#27A6A4" stroke-width="2"/>
    <rect x="31" y="37" width="58" height="28" rx="11" fill="#10151B"/>
    <g class="eyes">
      <circle cx="47" cy="51" r="8" fill="#27A6A4"/><circle cx="73" cy="51" r="8" fill="#27A6A4"/>
      <circle class="pupil" cx="47" cy="51" r="3.6" fill="#10151B"/>
      <circle class="pupil" cx="73" cy="51" r="3.6" fill="#10151B"/>
    </g>
    <path d="M50 73 Q60 80 70 73" stroke="#27A6A4" stroke-width="2" fill="none" stroke-linecap="round"/>
    <rect x="30" y="88" width="60" height="56" rx="12" fill="#161D25" stroke="#27A6A4" stroke-width="2"/>
    <circle class="led" cx="60" cy="110" r="5" fill="#E2A53D"/>
    <rect x="44" y="124" width="32" height="4" rx="2" fill="#4E5964"/>
    <g class="arm">
      <line x1="32" y1="98" x2="8" y2="98" stroke="#27A6A4" stroke-width="9" stroke-linecap="round"/>
      <circle cx="6" cy="98" r="7" fill="#E2A53D"/>
    </g>
  </svg>`;

  document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`);
  document.body.insertAdjacentHTML("beforeend",
    `<div id="bot">
       <div id="bot-say" role="status" aria-live="polite"></div>
       <button id="bot-btn" type="button" aria-label="Say hello to Bit, the portfolio bot">${svg}</button>
     </div>`);

  const bot = document.getElementById("bot");
  const say = document.getElementById("bot-say");
  const pupils = [...bot.querySelectorAll(".pupil")];
  let i = 0, hideT, waveT;

  function speak(text, ms = 5000) {
    say.textContent = text;
    say.classList.add("show");
    clearTimeout(hideT);
    hideT = setTimeout(() => say.classList.remove("show"), ms);
  }
  function wave(ms = 3000) {
    if (reduce) return;
    bot.classList.add("waving");
    clearTimeout(waveT);
    waveT = setTimeout(() => bot.classList.remove("waving"), ms);
  }

  // Slide in, then say hello
  setTimeout(() => bot.classList.add("in"), reduce ? 0 : 800);
  setTimeout(() => { speak(messages[0], 6000); wave(3500); }, reduce ? 500 : 2200);

  document.getElementById("bot-btn").addEventListener("click", () => {
    i = (i + 1) % messages.length;
    speak(messages[i]);
    wave(1800);
  });
  bot.addEventListener("mouseenter", () => wave(1500));

  // Eyes follow the pointer
  if (!reduce) {
    addEventListener("pointermove", (e) => {
      pupils.forEach((p) => {
        const r = p.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1, k = Math.min(3, d / 40);
        p.style.transform = `translate(${(dx / d) * k}px, ${(dy / d) * k}px)`;
      });
    }, { passive: true });
  }
})();
