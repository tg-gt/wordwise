import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WritingEditor } from "@/components/writing/writing-editor"

export default async function WritePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return <WritingEditor userId={data.user.id} />
} 