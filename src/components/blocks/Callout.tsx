type CalloutKind = 'note' | 'info' | 'tip' | 'warning';

interface CalloutProps {
  type?: CalloutKind;
  title?: string;
  children: React.ReactNode;
}

const KIND_STYLES: Record<CalloutKind, { container: string; label: string; iconColor: string }> = {
  note: {
    container: 'border-gray-300 bg-gray-50',
    label: 'text-gray-700',
    iconColor: 'text-gray-500',
  },
  info: {
    container: 'border-blue-300 bg-blue-50',
    label: 'text-blue-800',
    iconColor: 'text-blue-600',
  },
  tip: {
    container: 'border-emerald-300 bg-emerald-50',
    label: 'text-emerald-800',
    iconColor: 'text-emerald-600',
  },
  warning: {
    container: 'border-amber-300 bg-amber-50',
    label: 'text-amber-900',
    iconColor: 'text-amber-600',
  },
};

const ICON: Record<CalloutKind, React.ReactNode> = {
  note: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  tip: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

const LABEL: Record<CalloutKind, string> = {
  note: 'Note',
  info: 'Info',
  tip: 'Tip',
  warning: 'Warning',
};

export default function Callout({ type = 'note', title, children }: CalloutProps) {
  const styles = KIND_STYLES[type];
  return (
    <aside className={`my-6 mx-auto max-w-3xl rounded-md border-l-4 ${styles.container} p-4`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${styles.iconColor}`}>{ICON[type]}</div>
        <div className="flex-1">
          <p className={`text-xs font-semibold uppercase tracking-wide ${styles.label}`}>
            {title || LABEL[type]}
          </p>
          <div className="mt-1 text-sm text-gray-800">{children}</div>
        </div>
      </div>
    </aside>
  );
}
