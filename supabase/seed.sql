-- Demo wedding: Thukha & May Thet
-- Venue, end time, Myanmar-calendar date, family lineage and the final
-- bilingual wording are NOT confirmed yet. Those fields are left empty or
-- marked "TBC" on purpose. Photos are added by `pnpm seed:media`.

insert into public.weddings (
  id, slug, status, partner_one_name, partner_two_name, monogram,
  tagline, invitation_text, closing_quote, timezone
) values (
  '00000000-0000-4000-8000-000000000001',
  'thukha-maythet',
  'published',
  '{"en": "Thukha", "my": "သုခ"}',
  '{"en": "May Thet", "my": "မေသက်"}',
  'T&M',
  '{"en": "Two hearts, one journey, forever", "my": "နှလုံးသားနှစ်ခု၊ ခရီးတစ်ခု၊ ထာဝရ"}',
  '{"en": "[Draft — wording to be confirmed] Together with our families, we warmly invite you to celebrate our wedding day with us.",
    "my": "[မူကြမ်း — အတည်ပြုရန်] မိသားစုများနှင့်အတူ ကျွန်ုပ်တို့၏ မင်္ဂလာအခမ်းအနားသို့ ကြွရောက်ချီးမြှင့်ပေးပါရန် လေးစားစွာ ဖိတ်ကြားအပ်ပါသည်။"}',
  '{}',
  'Asia/Yangon'
);

insert into public.wedding_events (
  wedding_id, kind, title, starts_at, ends_at, venue_name, venue_address, sort_order
) values (
  '00000000-0000-4000-8000-000000000001',
  'ceremony',
  '{"en": "Wedding Ceremony", "my": "မင်္ဂလာအခမ်းအနား"}',
  '2027-02-13 11:30:00+06:30',
  null,
  '{"en": "Venue TBC", "my": "နေရာ အတည်ပြုရန်"}',
  '{"en": "Yangon, Myanmar", "my": "ရန်ကုန်မြို့၊ မြန်မာ"}',
  0
);

insert into public.guests (wedding_id, display_name, display_name_my, group_name, token) values
  ('00000000-0000-4000-8000-000000000001', 'Ko Aung',  'ကိုအောင်', 'Friends',    'ko-aung-7k2f'),
  ('00000000-0000-4000-8000-000000000001', 'Ma Su',    'မစု',      'Family',     'ma-su-3hq9'),
  ('00000000-0000-4000-8000-000000000001', 'Ko Min',   'ကိုမင်း',   'Colleagues', 'ko-min-p4xd'),
  ('00000000-0000-4000-8000-000000000001', 'Ma Hnin',  'မနှင်း',    'Friends',    'ma-hnin-9wbt'),
  ('00000000-0000-4000-8000-000000000001', 'Ko Zaw',   'ကိုဇော်',   'Family',     'ko-zaw-m6rc');

-- Demo gift invitation: The Lotus Sanctuary (/g/lotus-sanctuary). Fictional teacher and shop.
insert into public.gift_campaigns (id, slug, status, title, subtitle, default_view, shop_url, invite_enabled, invite_title, invite_text, invite_intentions, vip_code) values (
  '00000000-0000-4000-8000-0000000000a1', 'lotus-sanctuary', 'published', '{"en":"The Lotus Sanctuary","my":"ကြာပန်းဥယျာဉ်"}', '{"en":"12 Sacred Launch Blessings by Master Elena","my":"ဆရာမ Elena ၏ မိတ်ဆက်ဆုမင်္ဂလာ ၁၂ ပါး"}', 'lotus', 'https://example.com/shop', true,
  '{"en":"You Are Cordially Invited","my":"လေးစားစွာ ဖိတ်ကြားအပ်ပါသည်"}',
  '{"en":"Inscribe your name into the Lotus Sanctuary to receive your VIP Golden Key, private launch reminders and an instant 25% Welcome Blessing.","my":"VIP ရွှေသော့၊ မိတ်ဆက်ပွဲ သတိပေးချက်များနှင့် ၂၅% ကြိုဆိုလက်ဆောင်ကို ရယူရန် သင့်အမည်ကို ရေးထိုးပါ။"}',
  '[{"en":"Inner peace & meditation courses","my":"စိတ်ငြိမ်းချမ်းမှုနှင့် တရားထိုင်သင်တန်းများ"},{"en":"Sacred crystal jewellery & talismans","my":"ကျောက်စိမ်းလက်ဝတ်ရတနာများ"},{"en":"Her new spiritual awakening book","my":"စာအုပ်အသစ်"},{"en":"All 12 sanctuary blessings","my":"ဆုမင်္ဂလာ ၁၂ ပါးလုံး"}]',
  'LOTUSVIP25'
);

insert into public.gift_items (campaign_id, position, icon, kind, category, title, description, detail_title, detail_text, code) values
  ('00000000-0000-4000-8000-0000000000a1', 1, 'lotus', 'audio', '{"en":"Online Course Gift","my":"အွန်လိုင်းသင်တန်း လက်ဆောင်"}', '{"en":"528Hz Heart Opening Audio","my":"528Hz နှလုံးသားဖွင့် အသံ"}', '{"en":"An exclusive five-minute guided sound bath and breathwork session from Master Elena''s upcoming Awakening Course.","my":"ဆရာမ Elena ၏ လာမည့် Awakening သင်တန်းမှ ငါးမိနစ်ကြာ လမ်းညွှန်အသံနှင့် အသက်ရှူလေ့ကျင့်ခန်း အထူးအပိုင်း။"}', '{"en":"528Hz Heart Frequency Preview","my":"528Hz နှလုံးသားကြိမ်နှုန်း နမူနာ"}', '{"en":"Guided by Master Elena · 05:00","my":"ဆရာမ Elena ဦးဆောင် · ၀၅:၀၀"}', 'PEACE528'),
  ('00000000-0000-4000-8000-0000000000a1', 2, 'gem', 'voucher', '{"en":"Sacred Jewellery","my":"လက်ဝတ်ရတနာ"}', '{"en":"20% Off Moonstone Malas","my":"လကျောက်ပုတီး ၂၀% လျှော့"}', '{"en":"Enjoy 20% off any hand-knotted moonstone, rose quartz or amethyst bracelet from the new Launch Collection.","my":"မိတ်ဆက်စုစည်းမှုအသစ်မှ လကျောက်၊ ပန်းနုရောင်ကျောက် သို့မဟုတ် အမက်သစ်ကျောက် လက်ကောက်များကို ၂၀% လျှော့ဈေးဖြင့် ဝယ်ယူနိုင်ပါသည်။"}', '{}', '{}', 'MOONSTONE20'),
  ('00000000-0000-4000-8000-0000000000a1', 3, 'book', 'book', '{"en":"New Book Launch","my":"စာအုပ်အသစ်"}', '{"en":"Secret Chapter 1 Preview","my":"အခန်း ၁ ကြိုတင်ဖတ်ရှုခြင်း"}', '{"en":"Read an unreleased excerpt from her new book, Whispers of the Still Pond: Returning to Your Light.","my":"ဆရာမ၏ စာအုပ်အသစ် “Whispers of the Still Pond: Returning to Your Light” မှ မထုတ်ဝေရသေးသော ကောက်နုတ်ချက်ကို ဖတ်ရှုပါ။"}', '{"en":"Excerpt from page 14","my":"စာမျက်နှာ ၁၄ မှ ကောက်နုတ်ချက်"}', '{"en":"When the mind grows quiet like midnight water, every petal of your purpose opens without force…","my":"စိတ်သည် သန်းခေါင်ယံရေကဲ့သို့ ငြိမ်သက်လာသောအခါ သင့်ရည်ရွယ်ချက်၏ ပွင့်ဖတ်တိုင်းသည် အားမထုတ်ဘဲ ပွင့်လန်းလာပါလိမ့်မည်…"}', 'BOOKGIFT10'),
  ('00000000-0000-4000-8000-0000000000a1', 4, 'crystal', 'oracle', '{"en":"Daily Guidance","my":"နေ့စဉ်လမ်းညွှန်"}', '{"en":"Interactive Oracle Card Pull","my":"ဗေဒင်ကတ် ဆွဲခြင်း"}', '{"en":"Tap the card below to reveal your personal launch-day energy message from Master Elena''s Oracle Deck.","my":"အောက်ပါကတ်ကို နှိပ်၍ ဆရာမ Elena ၏ ဗေဒင်ကတ်အစုမှ ယနေ့အတွက် သင့်စွမ်းအင်သတင်းစကားကို ဖော်ထုတ်ပါ။"}', '{"en":"Tap to flip your oracle card","my":"ဗေဒင်ကတ်ကို လှန်ရန် နှိပ်ပါ"}', '{"en":"Abundance flows effortlessly toward the calm heart you are cultivating today.","my":"ယနေ့ သင်ပျိုးထောင်နေသော ငြိမ်သက်သည့်နှလုံးသားထံသို့ စည်းစိမ်ချမ်းသာများ ပင်ပန်းမှုမရှိဘဲ စီးဆင်းလာပါလိမ့်မည်။"}', 'ORACLE15'),
  ('00000000-0000-4000-8000-0000000000a1', 5, 'cap', 'voucher', '{"en":"Masterclass Voucher","my":"သင်တန်း ဗောက်ချာ"}', '{"en":"$30 Off Intuition Academy","my":"Intuition Academy $၃၀ လျှော့"}', '{"en":"Redeem this scholarship voucher toward her six-week live Spiritual Intuition & Energy Alignment programme.","my":"ဆရာမ၏ ခြောက်ပတ်ကြာ တိုက်ရိုက် ဝိညာဉ်အသိဉာဏ်နှင့် စွမ်းအင်ချိန်ညှိ သင်တန်းအတွက် ဤပညာသင်ဆု ဗောက်ချာကို အသုံးပြုနိုင်ပါသည်။"}', '{}', '{}', 'SOULCLASS30'),
  ('00000000-0000-4000-8000-0000000000a1', 6, 'flame', 'voucher', '{"en":"Ritual Accessories","my":"ဝတ်ပြုပစ္စည်း"}', '{"en":"Free Palo Santo & Selenite Wand","my":"Palo Santo နှင့် Selenite အခမဲ့"}', '{"en":"Receive a complimentary cleansing bundle with any jewellery or book order placed during launch week.","my":"မိတ်ဆက်ပတ်အတွင်း လက်ဝတ်ရတနာ သို့မဟုတ် စာအုပ် မည်သည့်အော်ဒါနှင့်မဆို သန့်စင်ရေးပစ္စည်းအစုံ အခမဲ့ ရရှိမည်။"}', '{}', '{}', 'CLEANSEFREE'),
  ('00000000-0000-4000-8000-0000000000a1', 7, 'moon', 'voucher', '{"en":"Live Circle Pass","my":"တိုက်ရိုက် ပွဲဝင်ခွင့်"}', '{"en":"Free Full Moon Sound Circle","my":"လပြည့် အသံဝိုင်း အခမဲ့"}', '{"en":"Your golden pass to join Master Elena''s private online Full Moon manifestation and healing ceremony.","my":"ဆရာမ Elena ၏ ကိုယ်ပိုင် အွန်လိုင်း လပြည့်ဆုတောင်းနှင့် ကုသရေး အခမ်းအနားသို့ ဝင်ရောက်ရန် သင့်ရွှေလက်မှတ်။"}', '{}', '{}', 'FULLMOONVIP'),
  ('00000000-0000-4000-8000-0000000000a1', 8, 'necklace', 'voucher', '{"en":"Limited Edition Jewellery","my":"အကန့်အသတ် လက်ဝတ်ရတနာ"}', '{"en":"24-Hour Early Vault Access","my":"၂၄ နာရီ ကြိုတင်ဝယ်ယူခွင့်"}', '{"en":"Unlock private early access to the 18k Gold Lotus Pendant before it opens to the public.","my":"၁၈ ကရက် ရွှေကြာဆွဲပင်ဒင့်ကို လူအများအတွက် မဖွင့်မီ သီးသန့် ကြိုတင်ဝယ်ယူခွင့် ရယူပါ။"}', '{}', '{}', 'GOLDLOTUS'),
  ('00000000-0000-4000-8000-0000000000a1', 9, 'pen', 'voucher', '{"en":"Book Collector Gift","my":"စာအုပ်စုဆောင်းသူ လက်ဆောင်"}', '{"en":"Signed Gold-Foil Bookplate","my":"လက်မှတ်ထိုး ရွှေရောင်စာအုပ်တံဆိပ်"}', '{"en":"Order her hardcover book and receive a hand-signed calligraphy blessing plate and a crystal bookmark.","my":"ဆရာမ၏ အဖုံးမာစာအုပ်ကို မှာယူလျှင် လက်မှတ်ရေးထိုး ဆုတောင်းစာလုံးလှပြားနှင့် ကျောက်စာညှပ် ရရှိမည်။"}', '{}', '{}', 'SIGNEDBOOK'),
  ('00000000-0000-4000-8000-0000000000a1', 10, 'leaf', 'book', '{"en":"Mini Course","my":"သင်တန်းတို"}', '{"en":"Morning Energy Shield Ritual","my":"နံနက်ခင်း စွမ်းအင်ကာကွယ်ရေး"}', '{"en":"A three-step printable ritual workbook and mini lesson to protect your aura before starting your day.","my":"နေ့မစတင်မီ သင့်အော်ရာကို ကာကွယ်ရန် သုံးဆင့်ပါ ပုံနှိပ်ထုတ်နိုင်သော ဝတ်ပြုလက်စွဲနှင့် သင်ခန်းစာတို။"}', '{"en":"From the workbook","my":"လက်စွဲမှ"}', '{"en":"Breathe in the first light, seal it at the heart, and walk out already whole.","my":"ပထမဆုံးအလင်းကို ရှူသွင်းပါ၊ နှလုံးသားတွင် တံဆိပ်ခတ်ပါ၊ ပြည့်စုံစွာ ထွက်ခွာပါ။"}', 'AURA100'),
  ('00000000-0000-4000-8000-0000000000a1', 11, 'sparkles', 'voucher', '{"en":"Sanctuary Bundle","my":"အစုံလိုက်"}', '{"en":"25% Off the Complete Launch Box","my":"အစုံလိုက် ၂၅% လျှော့"}', '{"en":"Save 25% when bundling her book, rose quartz bracelet and self-paced meditation course together.","my":"ဆရာမ၏ စာအုပ်၊ ပန်းနုရောင်ကျောက်လက်ကောက်နှင့် မိမိအချိန်နှင့် လေ့လာနိုင်သော တရားထိုင်သင်တန်းကို အတူဝယ်လျှင် ၂၅% ချွေတာနိုင်ပါသည်။"}', '{}', '{}', 'BUNDLE25'),
  ('00000000-0000-4000-8000-0000000000a1', 12, 'crown', 'voucher', '{"en":"Final Petal Blessing","my":"နောက်ဆုံး ဆုမင်္ဂလာ"}', '{"en":"Private 1-on-1 Reading Entry","my":"တစ်ဦးချင်း ဟောကိန်း ကံစမ်းခွင့်"}', '{"en":"You have bloomed the sanctuary. Use this golden key to enter the draw for a 30-minute 1-on-1 session and a $50 gift credit.","my":"သင်သည် ကြာဥယျာဉ်ကို ပွင့်စေခဲ့ပါပြီ။ ဤရွှေသော့ဖြင့် ၃၀ မိနစ် တစ်ဦးချင်း အစည်းအဝေးနှင့် $၅၀ လက်ဆောင်ခရက်ဒစ်ကို ကံစမ်းရန် ဝင်ရောက်ပါ။"}', '{}', '{}', 'SANCTUARY50');
