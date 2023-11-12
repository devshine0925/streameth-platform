import SessionController from '@/server/controller/session'
import SessionComponent from './components/SessionComponent'
import type { Metadata, ResolvingMetadata } from 'next'
import EventController from '@/server/controller/event'
import { headers } from 'next/headers'

export async function generateStaticParams({
  params,
}: {
  params: { organization: string; event: string }
}) {
  const sessionController = new SessionController()
  const eventSessions = await sessionController.getAllSessions({
    eventId: params.event,
  })

  return eventSessions.map((session) => ({
    organization: params.organization,
    event: params.event,
    session: session.id,
  }))
}

interface Params {
  params: {
    organization: string
    event: string
    session: string
  }
}

export default async function Page({ params }: Params) {
  const sController = new SessionController()
  const session = await sController.getSession(
    params.session,
    params.event
  )
  const allSessions = await sController.getAllSessions({
    eventId: params.event,
  })

  const currentIndex = allSessions.findIndex(
    (s) => s.id === params.session
  )
  const nextSession =
    currentIndex !== -1 && allSessions[currentIndex + 1]
      ? allSessions[currentIndex + 1]
      : null

  const head = headers()
  const pathname = head.get('next-url')
  const getOrg = pathname?.split('/')[1] ?? ''
  const eController = new EventController()
  const event = (
    await eController.getEvent(session.eventId, getOrg)
  ).toJson()
  const canDownload = event.enableVideoDownloader

  return (
    <SessionComponent
      params={params.organization}
      nextSession={nextSession}
      session={session}
      enableVideoDownloader={canDownload}
    />
  )
}

export async function generateMetadata(
  { params }: Params,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const sController = new SessionController()
  const session = await sController.getSession(
    params.session,
    params.event
  )
  const imageUrl = session.coverImage
    ? session.coverImage
    : session.id + '.png'
  try {
    return {
      title: `${session.name}`,
      description: session.description,
      openGraph: {
        images: [imageUrl],
      },
    }
  } catch (e) {
    console.log(e)
    return {
      title: 'streameth session',
    }
  }
}
