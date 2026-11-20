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
