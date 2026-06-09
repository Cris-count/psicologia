export interface RpmFrameMessage<T = unknown> {
  source?: string;
  eventName?: string;
  data?: T;
}

export interface RpmAvatarExportedPayload {
  url: string;
  userId?: string;
  avatarId?: string;
}

export interface RpmUserAuthorizedPayload {
  url: string;
}
