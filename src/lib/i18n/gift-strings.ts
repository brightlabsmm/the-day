import type { Locale } from "./numerals";

/** Interface text for gift invitation pages (/g/<slug>). Content comes from the campaign. */
const GIFT_STRINGS = {
  viewLotus: { my: "ကြာပွင့်ဖတ်များ", en: "Lotus Petals" },
  viewAstrolabe: { my: "နက္ခတ်စက်ဝိုင်း", en: "Astrolabe" },
  viewTarot: { my: "ဗေဒင်ကတ် ၁၂ ချပ်", en: "12 Oracle Cards" },
  viewsLabel: { my: "ပုံစံရွေးရန်", en: "Choose a view" },
  hintLotus: { my: "ကန်ရေပြင်ပေါ်ရှိ တောက်ပနေသော ကြာပွင့်ဖတ်တစ်ခုကို နှိပ်၍ လျှို့ဝှက်လက်ဆောင်ကို ဖွင့်ပါ။", en: "Touch any glowing lotus petal on the sacred pond to bloom a hidden gift." },
  hintAstrolabe: { my: "ရွှေရောင်စက်ဝိုင်းပေါ်ရှိ ကြယ်တစ်ပွင့်ကို ရွေး၍ လက်ဆောင်ကို ဖွင့်ပါ။", en: "Select a star along the golden astrolabe to unlock your gift." },
  hintTarot: { my: "ကတ် ၁၂ ချပ်ထဲမှ တစ်ချပ်ကို ဆွဲ၍ ဆုမင်္ဂလာကို ဖွင့်ပါ။", en: "Draw any of the twelve oracle cards to reveal a blessing." },
  progress: { my: "ဆုမင်္ဂလာ {n} / {total}", en: "{n} of {total} blessings" },
  core: { my: "ကြာနှလုံးသား", en: "Sacred Core" },
  coreLeft: { my: "ကျန် {n}", en: "{n} left" },
  coreDone: { my: "အားလုံး ပွင့်ပြီ", en: "Fully bloomed" },
  coreOpen: { my: "အဆုံးသတ် ဆုမင်္ဂလာ", en: "Grand blessing" },
  solstice: { my: "နေဝင်ရိုးသော့", en: "Solstice Key" },
  blessing: { my: "ဆုမင်္ဂလာ", en: "Blessing" },
  reveal: { my: "ဖွင့်ရန်", en: "Reveal" },
  code: { my: "လက်ဆောင်ကုဒ်", en: "Gift code" },
  copy: { my: "ကူးယူရန်", en: "Copy code" },
  copied: { my: "ကူးယူပြီး ✓", en: "Copied ✓" },
  copiedToast: { my: "ကုဒ် {code} ကို ကူးယူပြီးပါပြီ", en: "Copied code {code}" },
  redeem: { my: "ဆိုင်တွင် အသုံးပြုရန်", en: "Redeem in the shop" },
  keepBlooming: { my: "ဆက်လက်ဖွင့်ရန်", en: "Continue blooming" },
  close: { my: "ပိတ်ရန်", en: "Close" },
  playTone: { my: "အသံဖွင့်ရန်", en: "Play tone" },
  playing: { my: "အသံထွက်နေသည်…", en: "Resonating…" },
  flipCard: { my: "ကတ်ကို လှန်ရန် နှိပ်ပါ", en: "Tap to flip your oracle card" },
  vault: { my: "ကျွန်ုပ်၏ လက်ဆောင်သေတ္တာ", en: "My Gifts Vault" },
  vaultTitle: { my: "လက်ဆောင်သေတ္တာ", en: "My Sacred Vault" },
  vaultIntro: { my: "ဖွင့်ပြီးသော လက်ဆောင်နှင့် ကုဒ်အားလုံး", en: "Every gift and code you have unlocked" },
  vaultEmpty: { my: "သေတ္တာထဲ မရှိသေးပါ။ ကြာပွင့်ဖတ်တစ်ခုကို နှိပ်၍ ပထမဆုံး ဆုမင်္ဂလာကို ရယူပါ။", en: "Your vault is still quiet. Touch a petal to collect your first blessing." },
  startOver: { my: "အစမှ ပြန်စရန်", en: "Start over" },
  startedOver: { my: "ဆုမင်္ဂလာများကို ပြန်ပိတ်လိုက်ပါပြီ", en: "All blessings closed again" },
  back: { my: "ပြန်သွားရန်", en: "Back to the sanctuary" },
  invite: { my: "ဖိတ်စာ ရယူရန်", en: "E-Invitation" },
  inviteEyebrow: { my: "တရားဝင် ဖိတ်ကြားလွှာ", en: "Official E-Invitation" },
  inviteTitleFallback: { my: "လေးစားစွာ ဖိတ်ကြားအပ်ပါသည်", en: "You are cordially invited" },
  yourName: { my: "သင့်အမည်", en: "Your name" },
  contact: { my: "အီးမေးလ် သို့မဟုတ် Telegram / Viber", en: "Email or Telegram / Viber" },
  intention: { my: "ယနေ့ သင့်စိတ်က ဘာကို တမ်းတနေပါသလဲ။", en: "What is your soul calling for today?" },
  submitInvite: { my: "VIP လက်မှတ် ရယူရန်", en: "Break the seal & claim your VIP pass" },
  sending: { my: "ပို့နေသည်…", en: "Sending…" },
  vipForged: { my: "VIP လက်မှတ် ရရှိပါပြီ", en: "VIP pass forged" },
  welcome: { my: "ကြိုဆိုပါသည်၊ {name}", en: "Welcome, {name}" },
  vipKey: { my: "VIP ကုဒ်", en: "VIP key" },
  errName: { my: "အမည် ထည့်ပါ။", en: "Please enter your name." },
  errContact: { my: "ဆက်သွယ်ရန် လိပ်စာ ထည့်ပါ။", en: "Please enter how we can reach you." },
  errClosed: { my: "ဖိတ်စာ ပိတ်ထားပါသည်။", en: "Sign-ups are closed." },
  errBusy: { my: "ခဏစောင့်ပြီး ထပ်ကြိုးစားပါ။", en: "Please wait a moment and try again." },
  errGeneric: { my: "တစ်ခုခု မှားသွားပါသည်။ ထပ်ကြိုးစားပါ။", en: "Something went wrong. Please try again." },
  sound: { my: "နောက်ခံအသံ", en: "Ambient sound" },
  soundOn: { my: "နောက်ခံအသံ ဖွင့်ထားသည်", en: "Ambient sound on" },
  soundOff: { my: "နောက်ခံအသံ ပိတ်ထားသည်", en: "Ambient sound off" },
} as const satisfies Record<string, Record<Locale, string>>;

export type GiftStringKey = keyof typeof GIFT_STRINGS;

/** Gift page text, with {placeholders} filled from `vars`. */
export function gs(key: GiftStringKey, locale: Locale, vars?: Record<string, string | number>): string {
  let out: string = GIFT_STRINGS[key][locale];
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
  return out;
}
