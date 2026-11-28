import { Suspense } from "react";
import { Eye, EyeOff } from "lucide-react";
import { getWedding, formatWhen } from "@/lib/admin/data";
import { setWishHidden } from "@/lib/admin/actions/wishes";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Badge, Card, Empty, Loading } from "@/components/admin/ui";

export default function WishesPage(props: PageProps<"/admin/weddings/[slug]/wishes">) {
  return (
    <Suspense fallback={<Loading />}>
      <Wishes {...props} />
    </Suspense>
  );
}

async function Wishes({ params }: PageProps<"/admin/weddings/[slug]/wishes">) {
  const { slug } = await params;
  const { supabase, wedding: w } = await getWedding(slug);
  const { data } = await supabase
    .from("wishes")
    .select("id, author_name, message, is_hidden, created_at")
    .eq("wedding_id", w.id)
    .order("created_at", { ascending: false });
  const wishes = data ?? [];

  return (
    <Card title={`Wishes (${wishes.length})`} description="Hidden wishes stay visible only to the guest who wrote them.">
      {wishes.length === 0 ? (
        <Empty>No wishes yet.</Empty>
      ) : (
        <ul className="-mx-5 -my-5 divide-y divide-[#efe6d8]">
          {wishes.map((x) => (
            <li key={x.id} className={`flex items-start gap-4 px-5 py-4 ${x.is_hidden ? "bg-[#faf6f0]" : ""}`}>
              <div className={`min-w-0 flex-1 ${x.is_hidden ? "opacity-60" : ""}`}>
                <p className="break-words whitespace-pre-line">{x.message}</p>
                <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#8a7f75]">
                  <span className="font-medium text-[#5c524b]">{x.author_name}</span>
                  <span>{formatWhen(x.created_at, w.timezone)}</span>
                  {x.is_hidden && <Badge tone="no">Hidden</Badge>}
                </p>
              </div>
              <ActionForm action={setWishHidden}>
                <input type="hidden" name="slug" value={w.slug} />
                <input type="hidden" name="id" value={x.id} />
                <input type="hidden" name="hidden" value={String(!x.is_hidden)} />
                <SubmitButton variant="secondary">
                  {x.is_hidden ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
                  {x.is_hidden ? "Show" : "Hide"}
                </SubmitButton>
              </ActionForm>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
