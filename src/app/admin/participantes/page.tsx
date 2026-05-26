import { getAllParticipantsWithStats } from '@/lib/supabase/admin'
import ParticipantesClient from '@/components/admin/ParticipantesClient'

export default async function ParticipantesPage() {
  const participants = await getAllParticipantsWithStats()
  return <ParticipantesClient participants={participants} />
}
