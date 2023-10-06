import axios from 'axios'
import { apiUrl } from '@/server/utils'
import { IEvent } from '@/server/model/event'
import AddEventButton from './components/AddEventButton'
import EventEntry from './components/EventEntry'
import Link from 'next/link'
export async function generateStaticParams() {
  const data = await (await fetch(`${apiUrl()}/organizations`)).json()

  return data.map((org: { id: string }) => ({
    params: {
      organization: org.id,
    },
  }))
}

const EventPage = async ({ params }: { params: { organization: string } }) => {
  try {
    const response = await axios.get(`${apiUrl()}/organizations/${params.organization}/events`)
    const events: IEvent[] = response.data

    return (
      <div className="p-4 overflow-scroll">
        <Link href="/admin">
          <div className="text-blue-500">Back to Admin</div>
        </Link>

        <AddEventButton organization={params.organization} />
        <ul className="space-y-4">{events?.map((event) => <EventEntry key={event?.id} event={event} />)}</ul>
      </div>
    )
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

export default EventPage
