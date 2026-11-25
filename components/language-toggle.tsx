'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg border border-[var(--surface-border)] bg-[var(--surface-raised)] p-0.5"
      role="group"
      aria-label={t('Switch language')}
    >
      {!compact && (
        <Languages className="w-3.5 h-3.5 text-[var(--text-tertiary)] ml-1.5" aria-hidden="true" />
      )}
      {(['en', 'ru'] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          aria-label={code === 'en' ? t('English') : t('Russian')}
          className={`min-h-[28px] min-w-[30px] rounded-md px-1.5 text-[11px] font-mono font-semibold uppercase transition-colors ${
            language === code
              ? 'bg-[var(--brand-primary)] text-[var(--brand-ink)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
