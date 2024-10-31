import { fetchStage } from '@/lib/services/stageService';
import LivestreamEmbedCode from '@/app/studio/[organization]/livestreams/[streamId]/components/LivestreamEmbedCode';
import Multistream from '@/app/studio/[organization]/livestreams/[streamId]/components/Multistream';
import StreamConfigWithPlayer from '@/app/studio/[organization]/livestreams/[streamId]/components/StreamConfigWithPlayer';
import StreamHeader from '@/app/studio/[organization]/livestreams/[streamId]/components/StreamHeader';
import { fetchOrganization } from '@/lib/services/organizationService';
import { notFound } from 'next/navigation';

const StreamConfig = async ({
  organizationSlug,
  stageId,
}: {
  organizationSlug: string;
  stageId: string;
}) => {
  const organization = await fetchOrganization({ organizationSlug });
  if (!organization) return notFound();
  const stage = await fetchStage({ stage: stageId });
  if (!stage || !stage.streamSettings?.streamId) {
    return <div> no stage found</div>;
  }

  return (
    <div className="flex flex-col gap-4 items-center p-4 m-auto max-w-5xl">
      <StreamHeader organizationSlug={organizationSlug} stream={stage} />

      <StreamConfigWithPlayer stream={stage} />

      <Multistream
        organization={organization}
        organizationId={stage.organizationId as string}
        stream={stage}
      />

      <LivestreamEmbedCode
        streamId={stage?.streamSettings?.streamId}
        playbackId={stage?.streamSettings?.playbackId}
        playerName={stage?.name}
      />
    </div>
  );
};

export default StreamConfig;
