import type { Locale } from "./numerals";

const STRINGS = {
  dear: { my: "ချစ်ခင်ရပါသော", en: "Dear" },
  guestFallback: { my: "ဧည့်သည်တော်", en: "Honoured Guest" },
  invitedLabel: { my: "မင်္ဂလာဖိတ်ကြားလွှာ", en: "You are invited" },
  tapToOpen: { my: "ဖွင့်ရန် တံဆိပ်ကို နှိပ်ပါ", en: "Tap the seal to open" },
  openInvitation: { my: "ဖိတ်စာကို ဖွင့်ရန်", en: "Open invitation" },
  skip: { my: "ကျော်ရန်", en: "Skip" },
  theWeddingDay: { my: "THE WEDDING DAY", en: "THE WEDDING DAY" },
  and: { my: "နှင့်", en: "and" },
  invitationHeading: { my: "မင်္ဂလာဆောင်ပွဲ ဖိတ်ကြားလွှာ", en: "Wedding Invitation" },
  programmeHeading: { my: "မင်္ဂလာအစီအစဉ်", en: "Wedding Programme" },
  dateLabel: { my: "မင်္ဂလာနေ့ရက်", en: "Date" },
  timeLabel: { my: "မင်္ဂလာအချိန်", en: "Time" },
  venueLabel: { my: "မင်္ဂလာနေရာ", en: "Venue" },
  openMap: { my: "Google Maps တွင် ကြည့်ရန်", en: "Directions in Google Maps" },
  opensNewTab: { my: "(တဘ်အသစ်တွင် ဖွင့်မည်)", en: "(opens in a new tab)" },
  galleryHeading: { my: "ဓာတ်ပုံ အမှတ်တရများ", en: "Our Moments" },
  viewPhoto: { my: "ဓာတ်ပုံကို အပြည့်ကြည့်ရန်", en: "View photo full screen" },
  photoViewer: { my: "ဓာတ်ပုံ ကြည့်ရှုရန်", en: "Photo viewer" },
  close: { my: "ပိတ်ရန်", en: "Close" },
  previous: { my: "ယခင်ဓာတ်ပုံ", en: "Previous photo" },
  next: { my: "နောက်ဓာတ်ပုံ", en: "Next photo" },
  countdownHeading: { my: "မင်္ဂလာနေ့သို့", en: "Counting down to our day" },
  days: { my: "ရက်", en: "Days" },
  hours: { my: "နာရီ", en: "Hours" },
  minutes: { my: "မိနစ်", en: "Minutes" },
  seconds: { my: "စက္ကန့်", en: "Seconds" },
  countdownToday: { my: "ယနေ့ ကျွန်ုပ်တို့၏ မင်္ဂလာနေ့ ဖြစ်ပါသည်", en: "Today is our wedding day" },
  countdownAfter: {
    my: "ကြွရောက်ချီးမြှင့်ပေးကြသည့်အတွက် ကျေးဇူးအထူးတင်ရှိပါသည်",
    en: "Thank you for celebrating with us",
  },
  wishesHeading: { my: "ဆုမွန်ကောင်းများ", en: "Wishes for the Couple" },
  wishesIntro: { my: "မင်္ဂလာမောင်နှံအတွက် ဆုတောင်းစကား တစ်ခွန်း ချန်ထားခဲ့ပါ", en: "Leave a blessing for the couple" },
  wishName: { my: "အမည်", en: "Your name" },
  wishMessage: { my: "ဆုတောင်းစကား", en: "Your message" },
  wishSend: { my: "ပေးပို့ရန်", en: "Send wishes" },
  wishUpdate: { my: "ပြင်ဆင်ရန်", en: "Update my wish" },
  wishSending: { my: "ပေးပို့နေသည်…", en: "Sending…" },
  wishThanks: { my: "ကျေးဇူးတင်ပါသည်။ သင့်ဆုတောင်းစကားကို လက်ခံရရှိပါပြီ။", en: "Thank you — your wish has been received." },
  wishUpdated: { my: "သင့်ဆုတောင်းစကားကို ပြင်ဆင်ပြီးပါပြီ။", en: "Your wish has been updated." },
  wishYou: { my: "သင်", en: "You" },
  wishEmpty: { my: "ပထမဆုံး ဆုတောင်းစကားကို သင်ပေးပို့နိုင်ပါသည်။", en: "Be the first to leave a wish." },
  wishErrorName: { my: "အမည် ၁ မှ ၈၀ လုံးအတွင်း ထည့်ပါ။", en: "Please enter a name (1–80 characters)." },
  wishErrorMessage: { my: "ဆုတောင်းစကားကို ၁ မှ ၅၀၀ လုံးအတွင်း ရေးပါ။", en: "Please write a message (1–500 characters)." },
  wishErrorClosed: { my: "ဆုတောင်းစကား လက်ခံခြင်း ပိတ်ထားပါသည်။", en: "Wishes are closed." },
  wishErrorSent: { my: "သင့်ဆုတောင်းစကားကို ပေးပို့ပြီးဖြစ်ပါသည်။", en: "You have already sent a wish." },
  wishErrorGeneric: { my: "ပေးပို့၍မရပါ။ ထပ်ကြိုးစားပါ။", en: "Could not send. Please try again." },
} as const satisfies Record<string, Record<Locale, string>>;

export type StringKey = keyof typeof STRINGS;

export function s(key: StringKey, locale: Locale): string {
  return STRINGS[key][locale];
}

/** The guest's name in the chosen language, falling back sensibly. */
export function guestName(
  guest: { display_name: string; display_name_my: string | null } | null,
  locale: Locale,
): string {
  if (!guest) return s("guestFallback", locale);
  return locale === "my" ? guest.display_name_my || guest.display_name : guest.display_name;
}
