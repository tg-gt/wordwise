import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WritingEditor } from "@/components/writing/writing-editor"
import { AnimusWriterBanner } from "@/components/writing/animus-writer-banner"

export default async function WritePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="h-screen flex flex-col">
      <AnimusWriterBanner />
      <div className="flex-1 overflow-hidden">
        <WritingEditor userId={data.user.id} />
      </div>
    </div>
  )
} 