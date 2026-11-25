export interface CommunityLinks {
  telegram?: string;
  discord?: string;
  feedback?: string;
}

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Owner-provided destinations. These are intentionally optional: the UI hides
 * any link whose environment variable is not configured instead of inventing
 * a placeholder destination.
 */
export const COMMUNITY_LINKS: CommunityLinks = {
  telegram: clean(process.env.NEXT_PUBLIC_TELEGRAM_URL),
  discord: clean(process.env.NEXT_PUBLIC_DISCORD_URL),
  feedback: clean(process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL),
};

export function hasCommunityLinks(links: CommunityLinks = COMMUNITY_LINKS): boolean {
  return Boolean(links.telegram || links.discord || links.feedback);
}
