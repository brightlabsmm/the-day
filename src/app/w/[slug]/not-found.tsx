import { Flourish } from "@/components/ornaments";

export default function InvitationNotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-paper-deep px-4">
      <section className="paper frame-double w-full max-w-sm px-8 py-12 text-center text-navy">
        <p lang="my" className="text-lg">ဖိတ်စာကို ရှာမတွေ့ပါ</p>
        <p className="font-display mt-1 text-xl italic text-ink">This invitation could not be found.</p>
        <Flourish className="mx-auto mt-6 text-gold" />
        <p className="font-label mt-6 text-sm leading-relaxed text-ink-soft">
          Please check the link you received, or ask the couple to send it again.
        </p>
      </section>
    </main>
  );
}
