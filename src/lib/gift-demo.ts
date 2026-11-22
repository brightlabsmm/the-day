import type { GiftCampaign } from "@/lib/gift";

/**
 * The "Floating Lotus Sanctuary" demo: twelve launch blessings for a
 * fictional teacher. Used by the dev preview (/dev/gift); the same content is
 * in supabase/seed.sql as the campaign "lotus-sanctuary" (generated from this).
 * Burmese text here is a first draft and should be checked by a native reader.
 */
export const DEMO_GIFT_CAMPAIGN: GiftCampaign = {
  campaign: {
    id: "00000000-0000-4000-8000-0000000000a1",
    slug: "lotus-sanctuary",
    status: "published",
    title: { en: "The Lotus Sanctuary", my: "ကြာပန်းဥယျာဉ်" },
    subtitle: { en: "12 Sacred Launch Blessings by Master Elena", my: "ဆရာမ Elena ၏ မိတ်ဆက်ဆုမင်္ဂလာ ၁၂ ပါး" },
    default_view: "lotus",
    shop_url: "https://example.com/shop",
    invite_enabled: true,
    invite_title: { en: "You Are Cordially Invited", my: "လေးစားစွာ ဖိတ်ကြားအပ်ပါသည်" },
    invite_text: {
      en: "Inscribe your name into the Lotus Sanctuary to receive your VIP Golden Key, private launch reminders and an instant 25% Welcome Blessing.",
      my: "VIP ရွှေသော့၊ မိတ်ဆက်ပွဲ သတိပေးချက်များနှင့် ၂၅% ကြိုဆိုလက်ဆောင်ကို ရယူရန် သင့်အမည်ကို ရေးထိုးပါ။",
    },
    invite_intentions: [
      { en: "Inner peace & meditation courses", my: "စိတ်ငြိမ်းချမ်းမှုနှင့် တရားထိုင်သင်တန်းများ" },
      { en: "Sacred crystal jewellery & talismans", my: "ကျောက်စိမ်းလက်ဝတ်ရတနာများ" },
      { en: "Her new spiritual awakening book", my: "စာအုပ်အသစ်" },
      { en: "All 12 sanctuary blessings", my: "ဆုမင်္ဂလာ ၁၂ ပါးလုံး" },
    ],
  },
  items: [
    {
      position: 1, icon: "lotus", kind: "audio", code: "PEACE528",
      category: { en: "Online Course Gift", my: "အွန်လိုင်းသင်တန်း လက်ဆောင်" },
      title: { en: "528Hz Heart Opening Audio", my: "528Hz နှလုံးသားဖွင့် အသံ" },
      description: {
        en: "An exclusive five-minute guided sound bath and breathwork session from Master Elena's upcoming Awakening Course.",
        my: "ဆရာမ Elena ၏ လာမည့် Awakening သင်တန်းမှ ငါးမိနစ်ကြာ လမ်းညွှန်အသံနှင့် အသက်ရှူလေ့ကျင့်ခန်း အထူးအပိုင်း။",
      },
      detail_title: { en: "528Hz Heart Frequency Preview", my: "528Hz နှလုံးသားကြိမ်နှုန်း နမူနာ" },
      detail_text: { en: "Guided by Master Elena · 05:00", my: "ဆရာမ Elena ဦးဆောင် · ၀၅:၀၀" },
    },
    {
      position: 2, icon: "gem", kind: "voucher", code: "MOONSTONE20",
      category: { en: "Sacred Jewellery", my: "လက်ဝတ်ရတနာ" },
      title: { en: "20% Off Moonstone Malas", my: "လကျောက်ပုတီး ၂၀% လျှော့" },
      description: {
        en: "Enjoy 20% off any hand-knotted moonstone, rose quartz or amethyst bracelet from the new Launch Collection.",
        my: "မိတ်ဆက်စုစည်းမှုအသစ်မှ လကျောက်၊ ပန်းနုရောင်ကျောက် သို့မဟုတ် အမက်သစ်ကျောက် လက်ကောက်များကို ၂၀% လျှော့ဈေးဖြင့် ဝယ်ယူနိုင်ပါသည်။",
      },
      detail_title: {}, detail_text: {},
    },
    {
      position: 3, icon: "book", kind: "book", code: "BOOKGIFT10",
      category: { en: "New Book Launch", my: "စာအုပ်အသစ်" },
      title: { en: "Secret Chapter 1 Preview", my: "အခန်း ၁ ကြိုတင်ဖတ်ရှုခြင်း" },
      description: {
        en: "Read an unreleased excerpt from her new book, Whispers of the Still Pond: Returning to Your Light.",
        my: "ဆရာမ၏ စာအုပ်အသစ် “Whispers of the Still Pond: Returning to Your Light” မှ မထုတ်ဝေရသေးသော ကောက်နုတ်ချက်ကို ဖတ်ရှုပါ။",
      },
      detail_title: { en: "Excerpt from page 14", my: "စာမျက်နှာ ၁၄ မှ ကောက်နုတ်ချက်" },
      detail_text: {
        en: "When the mind grows quiet like midnight water, every petal of your purpose opens without force…",
        my: "စိတ်သည် သန်းခေါင်ယံရေကဲ့သို့ ငြိမ်သက်လာသောအခါ သင့်ရည်ရွယ်ချက်၏ ပွင့်ဖတ်တိုင်းသည် အားမထုတ်ဘဲ ပွင့်လန်းလာပါလိမ့်မည်…",
      },
    },
    {
      position: 4, icon: "crystal", kind: "oracle", code: "ORACLE15",
      category: { en: "Daily Guidance", my: "နေ့စဉ်လမ်းညွှန်" },
      title: { en: "Interactive Oracle Card Pull", my: "ဗေဒင်ကတ် ဆွဲခြင်း" },
      description: {
        en: "Tap the card below to reveal your personal launch-day energy message from Master Elena's Oracle Deck.",
        my: "အောက်ပါကတ်ကို နှိပ်၍ ဆရာမ Elena ၏ ဗေဒင်ကတ်အစုမှ ယနေ့အတွက် သင့်စွမ်းအင်သတင်းစကားကို ဖော်ထုတ်ပါ။",
      },
      detail_title: { en: "Tap to flip your oracle card", my: "ဗေဒင်ကတ်ကို လှန်ရန် နှိပ်ပါ" },
      detail_text: {
        en: "Abundance flows effortlessly toward the calm heart you are cultivating today.",
        my: "ယနေ့ သင်ပျိုးထောင်နေသော ငြိမ်သက်သည့်နှလုံးသားထံသို့ စည်းစိမ်ချမ်းသာများ ပင်ပန်းမှုမရှိဘဲ စီးဆင်းလာပါလိမ့်မည်။",
      },
    },
    {
      position: 5, icon: "cap", kind: "voucher", code: "SOULCLASS30",
      category: { en: "Masterclass Voucher", my: "သင်တန်း ဗောက်ချာ" },
      title: { en: "$30 Off Intuition Academy", my: "Intuition Academy $၃၀ လျှော့" },
      description: {
        en: "Redeem this scholarship voucher toward her six-week live Spiritual Intuition & Energy Alignment programme.",
        my: "ဆရာမ၏ ခြောက်ပတ်ကြာ တိုက်ရိုက် ဝိညာဉ်အသိဉာဏ်နှင့် စွမ်းအင်ချိန်ညှိ သင်တန်းအတွက် ဤပညာသင်ဆု ဗောက်ချာကို အသုံးပြုနိုင်ပါသည်။",
      },
      detail_title: {}, detail_text: {},
    },
    {
      position: 6, icon: "flame", kind: "voucher", code: "CLEANSEFREE",
      category: { en: "Ritual Accessories", my: "ဝတ်ပြုပစ္စည်း" },
      title: { en: "Free Palo Santo & Selenite Wand", my: "Palo Santo နှင့် Selenite အခမဲ့" },
      description: {
        en: "Receive a complimentary cleansing bundle with any jewellery or book order placed during launch week.",
        my: "မိတ်ဆက်ပတ်အတွင်း လက်ဝတ်ရတနာ သို့မဟုတ် စာအုပ် မည်သည့်အော်ဒါနှင့်မဆို သန့်စင်ရေးပစ္စည်းအစုံ အခမဲ့ ရရှိမည်။",
      },
      detail_title: {}, detail_text: {},
    },
    {
      position: 7, icon: "moon", kind: "voucher", code: "FULLMOONVIP",
      category: { en: "Live Circle Pass", my: "တိုက်ရိုက် ပွဲဝင်ခွင့်" },
      title: { en: "Free Full Moon Sound Circle", my: "လပြည့် အသံဝိုင်း အခမဲ့" },
      description: {
        en: "Your golden pass to join Master Elena's private online Full Moon manifestation and healing ceremony.",
        my: "ဆရာမ Elena ၏ ကိုယ်ပိုင် အွန်လိုင်း လပြည့်ဆုတောင်းနှင့် ကုသရေး အခမ်းအနားသို့ ဝင်ရောက်ရန် သင့်ရွှေလက်မှတ်။",
      },
      detail_title: {}, detail_text: {},
    },
    {
      position: 8, icon: "necklace", kind: "voucher", code: "GOLDLOTUS",
      category: { en: "Limited Edition Jewellery", my: "အကန့်အသတ် လက်ဝတ်ရတနာ" },
      title: { en: "24-Hour Early Vault Access", my: "၂၄ နာရီ ကြိုတင်ဝယ်ယူခွင့်" },
      description: {
        en: "Unlock private early access to the 18k Gold Lotus Pendant before it opens to the public.",
        my: "၁၈ ကရက် ရွှေကြာဆွဲပင်ဒင့်ကို လူအများအတွက် မဖွင့်မီ သီးသန့် ကြိုတင်ဝယ်ယူခွင့် ရယူပါ။",
      },
      detail_title: {}, detail_text: {},
    },
    {
      position: 9, icon: "pen", kind: "voucher", code: "SIGNEDBOOK",
      category: { en: "Book Collector Gift", my: "စာအုပ်စုဆောင်းသူ လက်ဆောင်" },
      title: { en: "Signed Gold-Foil Bookplate", my: "လက်မှတ်ထိုး ရွှေရောင်စာအုပ်တံဆိပ်" },
      description: {
        en: "Order her hardcover book and receive a hand-signed calligraphy blessing plate and a crystal bookmark.",
        my: "ဆရာမ၏ အဖုံးမာစာအုပ်ကို မှာယူလျှင် လက်မှတ်ရေးထိုး ဆုတောင်းစာလုံးလှပြားနှင့် ကျောက်စာညှပ် ရရှိမည်။",
      },
      detail_title: {}, detail_text: {},
    },
    {
      position: 10, icon: "leaf", kind: "book", code: "AURA100",
      category: { en: "Mini Course", my: "သင်တန်းတို" },
      title: { en: "Morning Energy Shield Ritual", my: "နံနက်ခင်း စွမ်းအင်ကာကွယ်ရေး" },
      description: {
        en: "A three-step printable ritual workbook and mini lesson to protect your aura before starting your day.",
        my: "နေ့မစတင်မီ သင့်အော်ရာကို ကာကွယ်ရန် သုံးဆင့်ပါ ပုံနှိပ်ထုတ်နိုင်သော ဝတ်ပြုလက်စွဲနှင့် သင်ခန်းစာတို။",
      },
      detail_title: { en: "From the workbook", my: "လက်စွဲမှ" },
      detail_text: {
        en: "Breathe in the first light, seal it at the heart, and walk out already whole.",
        my: "ပထမဆုံးအလင်းကို ရှူသွင်းပါ၊ နှလုံးသားတွင် တံဆိပ်ခတ်ပါ၊ ပြည့်စုံစွာ ထွက်ခွာပါ။",
      },
    },
    {
      position: 11, icon: "sparkles", kind: "voucher", code: "BUNDLE25",
      category: { en: "Sanctuary Bundle", my: "အစုံလိုက်" },
      title: { en: "25% Off the Complete Launch Box", my: "အစုံလိုက် ၂၅% လျှော့" },
      description: {
        en: "Save 25% when bundling her book, rose quartz bracelet and self-paced meditation course together.",
        my: "ဆရာမ၏ စာအုပ်၊ ပန်းနုရောင်ကျောက်လက်ကောက်နှင့် မိမိအချိန်နှင့် လေ့လာနိုင်သော တရားထိုင်သင်တန်းကို အတူဝယ်လျှင် ၂၅% ချွေတာနိုင်ပါသည်။",
      },
      detail_title: {}, detail_text: {},
    },
    {
      position: 12, icon: "crown", kind: "voucher", code: "SANCTUARY50",
      category: { en: "Final Petal Blessing", my: "နောက်ဆုံး ဆုမင်္ဂလာ" },
      title: { en: "Private 1-on-1 Reading Entry", my: "တစ်ဦးချင်း ဟောကိန်း ကံစမ်းခွင့်" },
      description: {
        en: "You have bloomed the sanctuary. Use this golden key to enter the draw for a 30-minute 1-on-1 session and a $50 gift credit.",
        my: "သင်သည် ကြာဥယျာဉ်ကို ပွင့်စေခဲ့ပါပြီ။ ဤရွှေသော့ဖြင့် ၃၀ မိနစ် တစ်ဦးချင်း အစည်းအဝေးနှင့် $၅၀ လက်ဆောင်ခရက်ဒစ်ကို ကံစမ်းရန် ဝင်ရောက်ပါ။",
      },
      detail_title: {}, detail_text: {},
    },
  ],
};
