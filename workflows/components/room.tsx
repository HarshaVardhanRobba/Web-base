"use client"

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense"
import type { ReactNode } from "react"

import { Spinner } from "@/components/ui/spinner"

export function Room({
  roomId,
  children,
}: {
  roomId: string
  children: ReactNode
}) {
  return (
    // ID token auth: the endpoint identifies the user with Clerk and returns a
    // token. Room access comes from the permissions on the room itself, so a
    // room has to exist with groupsAccesses for the organization before anyone
    // can join it.
    <LiveblocksProvider authEndpoint="/api/liveblocks/auth">
      <RoomProvider id={roomId}>
        <ClientSideSuspense
          fallback={
            <div className="flex size-full items-center justify-center">
              <Spinner />
            </div>
          }
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
