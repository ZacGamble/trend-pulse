import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditKeywordForm } from "./edit-form";

export default async function EditKeywordPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const keywordId = parseInt(resolvedParams.id, 10);
  
  if (isNaN(keywordId)) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Fetch the specific keyword, ensuring it belongs to the logged-in user
  const { data: keyword } = await supabase
    .from("keywords")
    .select("*")
    .eq("id", keywordId)
    .eq("user_id", user.id)
    .single();

  if (!keyword) {
    notFound();
  }

  return <EditKeywordForm keyword={keyword} />;
}
