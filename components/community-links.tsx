'use client';

import React from 'react';
import { ClipboardList, MessagesSquare, Send } from 'lucide-react';
import { COMMUNITY_LINKS } from '@/lib/community';
import { useI18n } from '@/lib/i18n';

type CommunityVariant = 'sidebar' | 'inline' | 'footer';

interface CommunityLinksProps {
  variant?: CommunityVariant;
  collapsed?: boolean;
}

export function CommunityLinks({ variant = 'inline', collapsed = false }: CommunityLinksProps) {
  const { t } = useI18n();

  const links = [
    COMMUNITY_LINKS.telegram
      ? { href: COMMUNITY_LINKS.telegram, label: t('Telegram community'), short: 'Telegram', icon: Send }
      : null,
    COMMUNITY_LINKS.discord
      ? { href: COMMUNITY_LINKS.discord, label: t('Discord server'), short: 'Discord', icon: MessagesSquare }
      : null,
    COMMUNITY_LINKS.feedback
      ? { href: COMMUNITY_LINKS.feedback, label: t('Share feedback'), short: t('Feedback form'), icon: ClipboardList }
      : null,
  ].filter((link): link is NonNullable<typeof link> => Boolean(link));

  if (links.length === 0) return null;

  if (variant === 'footer') {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {links.map(({ href, label, icon: Icon }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors"
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{label}</span>
          </a>
        ))}
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={collapsed ? 'flex flex-col items-center gap-1' : 'space-y-1'}>
        {!collapsed && (
          <p className="px-2 pb-1 text-[11px] font-mono uppercase tracking-wide text-[var(--text-tertiary)]">
            {t('Community')}
          </p>
        )}
        {links.map(({ href, label, short, icon: Icon }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className={`relative group min-h-[36px] w-full flex items-center rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]/60 transition-colors ${
              collapsed ? 'justify-center px-0' : 'gap-2.5 px-3 py-2'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0 text-[var(--text-tertiary)]" aria-hidden="true" />
            {!collapsed && <span>{short}</span>}
            {collapsed && (
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-40 px-2.5 py-1.5 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-overlay)] text-xs font-medium text-[var(--text-primary)] shadow-[0_4px_12px_rgba(0,0,0,0.2)] whitespace-nowrap opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-all duration-150"
              >
                {label}
              </span>
            )}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map(({ href, label, short, icon: Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--surface-border)] bg-[var(--surface-overlay)] text-[var(--text-primary)] hover:border-[var(--text-tertiary)] whitespace-nowrap transition-colors"
        >
          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{short || label}</span>
        </a>
      ))}
    </div>
  );
}
