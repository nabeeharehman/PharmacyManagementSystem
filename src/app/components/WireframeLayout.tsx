import { useNavigate } from 'react-router';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarItem {
  label: string;
  path: string;
  active?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  title?: string;
}

interface WireframeLayoutProps {
  sidebar?: React.ReactNode;
  title?: string;
  children: React.ReactNode;
}

interface WireframeBoxProps {
  label?: string;
  height?: string;
  className?: string;
}

interface WireframeButtonProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

interface WireframeCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({ items, title = 'PharmaSphere' }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col bg-neutral-900 text-white">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-neutral-700">
        <div className="text-sm font-mono font-bold tracking-widest text-white uppercase">
          {title}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`w-full text-left px-6 py-3 text-xs font-mono transition-colors ${
              item.active
                ? 'bg-white text-neutral-900 font-bold'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-700">
        <div className="text-xs font-mono text-neutral-600">v1.0.0</div>
      </div>
    </div>
  );
}

// ─── WireframeLayout ──────────────────────────────────────────────────────────

export function WireframeLayout({ sidebar, title, children }: WireframeLayoutProps) {
  return (
    <div className="min-h-screen flex bg-neutral-100 font-mono">
      {/* Sidebar */}
      {sidebar && (
        <div className="w-56 min-h-screen flex-shrink-0 shadow-lg">
          {sidebar}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        {/* Top Bar */}
        {title && (
          <header className="bg-white border-b-2 border-neutral-300 px-8 py-4 flex-shrink-0">
            <h1 className="text-sm font-mono font-bold text-neutral-800 uppercase tracking-wide">
              {title}
            </h1>
          </header>
        )}

        {/* Page Body */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── WireframeBox ─────────────────────────────────────────────────────────────

export function WireframeBox({ label, height = 'h-10', className = '' }: WireframeBoxProps) {
  return (
    <div
      className={`border-2 border-neutral-400 bg-white flex items-center px-3 text-xs font-mono text-neutral-500 ${height} ${className}`}
    >
      {label || ''}
    </div>
  );
}

// ─── WireframeButton ──────────────────────────────────────────────────────────

export function WireframeButton({
  label,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
}: WireframeButtonProps) {
  const base = 'px-4 py-2 text-xs font-mono border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<string, string> = {
    primary:
      'bg-neutral-800 text-white border-neutral-900 hover:bg-neutral-700',
    secondary:
      'bg-white text-neutral-800 border-neutral-400 hover:bg-neutral-100',
    danger:
      'bg-red-700 text-white border-red-900 hover:bg-red-600',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {label}
    </button>
  );
}

// ─── WireframeCard ────────────────────────────────────────────────────────────

export function WireframeCard({ title, children, className = '' }: WireframeCardProps) {
  return (
    <div className={`bg-white border-2 border-neutral-300 p-6 ${className}`}>
      {title && (
        <div className="text-xs font-mono font-bold text-neutral-800 uppercase tracking-wide mb-4 pb-2 border-b-2 border-neutral-300">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
