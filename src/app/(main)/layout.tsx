import { getUser } from "@/server/actions/auth-actions"
import { redirect } from "next/navigation"

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user) {
    redirect('/auth/signin')
  }


  return (
    <div>{children}</div>
  )

}
