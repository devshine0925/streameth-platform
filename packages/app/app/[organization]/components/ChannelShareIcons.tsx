'use client'
import React from 'react'
import { Globe, Share2 } from 'lucide-react'
import { Credenza, CredenzaTrigger } from '@/components/ui/crezenda'
import { ShareModalContent } from '@/components/misc/interact/ShareButton'
import Link from 'next/link'
import { IExtendedOrganization } from '@/lib/types'

const ChannelShareIcons = ({
  organization,
}: {
  organization: IExtendedOrganization
}) => {
  return (
    <div className="flex flex-row justify-center items-center px-4 space-x-4">
      <Credenza>
        <CredenzaTrigger>
          <Share2
            className="text-white text-muted-foreground"
            width={22}
            height={22}
          />
        </CredenzaTrigger>
        <ShareModalContent shareFor="channel" />
      </Credenza>

      {/* {organization?.twitter && (
        <Link
          target="_blank"
          rel="noopener"
          href={organization?.twitter}>
          <XIcon size={25} round />
        </Link>
      )} */}

      {organization?.url && (
        <Link target="_blank" rel="noopener" href={organization?.url}>
          <Globe
            className="text-white text-muted-foreground"
            size={25}
          />
        </Link>
      )}
    </div>
  )
}

export default ChannelShareIcons
