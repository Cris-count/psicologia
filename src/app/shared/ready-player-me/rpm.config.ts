import { environment } from '../../../environments/environment';

/** Subdominio de Ready Player Me (Studio → Application → Subdomain). */
export const RPM_SUBDOMAIN = environment.rpm.subdomain;

export const RPM_CREATOR = environment.rpm.creator;

/** URL del iframe del creador para esta app. */
export const RPM_CREATOR_ORIGIN = `https://${RPM_SUBDOMAIN}.readyplayer.me`;
