'use client';

import EmbedButton from '@/components/misc/interact/EmbedButton';
import ShareButton from '@/components/misc/interact/ShareButton';
import VideoDownloadClient from '@/components/misc/VideoDownloadClient';

const SessionOptions = ({
  name,
  playbackId,
  assetId,
  organizationSlug,
  sessionId,
}: {
  name: string;
  playbackId: string;
  assetId?: string;
  organizationSlug: string;
  sessionId: string;
}) => {
  return (
    <div className="flex flex-row w-full items-center gap-2">
      <ShareButton
        className="w-full"
        variant="outline"
        url={
          typeof window !== 'undefined'
            ? `${window.location.origin}/${organizationSlug}/watch?session=${sessionId}`
            : ''
        }
        shareFor="video"
      />
      <EmbedButton
        className="w-full"
        sessionId={sessionId}
        playerName={name}
        vod
      />

      <VideoDownloadClient
        className="space-x-1 border"
        variant={'outline'}
        videoName={name}
        assetId={assetId}
        collapsable={true}
      />
    </div>
  );
};

export default SessionOptions;
