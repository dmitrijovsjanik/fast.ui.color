import { useState } from 'react';
import type { Palette, AlphaPalette, SemanticRole } from '@color-tool/core';
import { checkAPCAContrast } from '@color-tool/core';
import { Info, CheckCircle, AlertTriangle, XCircle, TrendingUp, Mail } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface ComponentShowcaseProps {
  palette: Palette;
  alphaPalette?: AlphaPalette;
}

function contrastFg(bg: string): string {
  const whiteLc = Math.abs(checkAPCAContrast('#ffffff', bg));
  return whiteLc >= 45 ? '#ffffff' : '#000000';
}

export function ComponentShowcase({ palette, alphaPalette }: ComponentShowcaseProps) {
  const p = palette;
  const ap = alphaPalette;
  const [notificationsOn, setNotificationsOn] = useState(true);

  // Alpha bg for a role+step, fallback to solid hex
  const abg = (role: SemanticRole, step: 2 | 3) => ap?.[role]?.[step]?.css ?? p[role][step];

  return (
    <div className="mt-6 space-y-8">
      {/* Buttons */}
      <section>
        <h3 className="text-xs font-medium mb-3" style={{ color: p.neutral[11] }}>Buttons</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-opacity hover:opacity-80 active:opacity-70"
            style={{ backgroundColor: p.brand[9], color: contrastFg(p.brand[9]) }}
          >
            Save
          </button>
          <button
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-opacity hover:opacity-80 active:opacity-70"
            style={{ backgroundColor: abg('neutral', 3), color: p.neutral[12] }}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-opacity hover:opacity-80 active:opacity-70"
            style={{ backgroundColor: p.danger[9], color: contrastFg(p.danger[9]) }}
          >
            Delete
          </button>
          <button
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-opacity hover:opacity-80 active:opacity-70"
            style={{ border: `1px solid ${p.brand[7]}`, color: p.brand[11], background: 'transparent' }}
          >
            Edit
          </button>
          <button
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-opacity hover:opacity-80 active:opacity-70"
            style={{ color: p.brand[11], background: 'transparent' }}
          >
            More
          </button>
          <button
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-opacity hover:opacity-80 active:opacity-70"
            style={{ backgroundColor: p.success[9], color: contrastFg(p.success[9]) }}
          >
            Confirm
          </button>
          <button
            className="px-3 py-1.5 rounded-md text-sm font-medium opacity-50 cursor-not-allowed" disabled
            style={{ backgroundColor: p.warning[9], color: contrastFg(p.warning[9]) }}
          >
            Caution
          </button>
        </div>
      </section>

      {/* Alerts */}
      <section>
        <h3 className="text-xs font-medium mb-3" style={{ color: p.neutral[11] }}>Alerts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {([
            { role: 'info' as const, Icon: Info, text: 'New version available.' },
            { role: 'success' as const, Icon: CheckCircle, text: 'Changes saved successfully.' },
            { role: 'warning' as const, Icon: AlertTriangle, text: 'API rate limit approaching.' },
            { role: 'danger' as const, Icon: XCircle, text: 'Payment method declined.' },
          ]).map(({ role, Icon, text }) => (
            <div
              key={role}
              className="flex items-start gap-2 px-3 py-2.5 rounded-md text-sm"
              style={{
                backgroundColor: abg(role, 3),
                border: `1px solid ${p[role][6]}`,
                color: p[role][11],
              }}
            >
              <Icon size={16} className="mt-0.5 shrink-0" style={{ color: p[role][9] }} />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Form + Validation */}
      <section>
        <h3 className="text-xs font-medium mb-3" style={{ color: p.neutral[11] }}>Form</h3>
        <div className="space-y-3 max-w-sm">
          {/* Normal input */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: p.neutral[11] }}>
              <Mail size={12} className="inline mr-1" />
              Email
            </label>
            <input
              type="text"
              placeholder="you@example.com"
              className="w-full px-3 py-1.5 rounded-md text-sm bg-transparent outline-none"
              style={{ border: `1px solid ${p.neutral[6]}`, color: p.neutral[12] }}
            />
          </div>

          {/* Error input */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: p.neutral[11] }}>
              Email
            </label>
            <input
              type="text"
              value="invalid-email"
              className="w-full px-3 py-1.5 rounded-md text-sm bg-transparent outline-none"
              style={{ border: `1px solid ${p.danger[7]}`, color: p.neutral[12] }}
            />
            <p className="text-xs mt-1" style={{ color: p.danger[11] }}>Invalid email address</p>
          </div>

          {/* Success input */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: p.neutral[11] }}>
              Username
            </label>
            <input
              type="text"
              value="alexjohnson"
              className="w-full px-3 py-1.5 rounded-md text-sm bg-transparent outline-none"
              style={{ border: `1px solid ${p.success[7]}`, color: p.neutral[12] }}
            />
            <p className="text-xs mt-1" style={{ color: p.success[11] }}>Username available</p>
          </div>

          {/* Switch */}
          <div className="flex items-center gap-2 pt-1">
            <Switch
              id="showcase-notifications"
              checked={notificationsOn}
              onCheckedChange={setNotificationsOn}
            />
            <label
              htmlFor="showcase-notifications"
              className="text-sm cursor-pointer"
              style={{ color: p.neutral[11] }}
            >
              Notifications
            </label>
          </div>
        </div>
      </section>

      {/* Badges + Cards + Typography */}
      <section>
        <h3 className="text-xs font-medium mb-3" style={{ color: p.neutral[11] }}>Badges</h3>
        <div className="flex flex-wrap gap-1.5 mb-6">
          {([
            { role: 'brand' as const, label: 'New' },
            { role: 'success' as const, label: 'Active' },
            { role: 'warning' as const, label: 'Pending' },
            { role: 'danger' as const, label: 'Expired' },
            { role: 'info' as const, label: 'Beta' },
            { role: 'neutral' as const, label: 'Draft' },
          ]).map(({ role, label }) => (
            <span
              key={role}
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: abg(role, 3), color: p[role][11] }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* User card */}
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: abg('neutral', 2), border: `1px solid ${p.neutral[6]}` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ backgroundColor: p.brand[9], color: contrastFg(p.brand[9]) }}
              >
                AJ
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: p.neutral[12] }}>Alex Johnson</p>
                <p className="text-xs truncate" style={{ color: p.neutral[9] }}>alex@example.com</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: abg('brand', 3), color: p.brand[11] }}
              >
                Admin
              </span>
              <button
                className="px-2.5 py-1 rounded-md text-xs font-medium transition-opacity hover:opacity-80 active:opacity-70"
                style={{ border: `1px solid ${p.brand[7]}`, color: p.brand[11], background: 'transparent' }}
              >
                Edit
              </button>
            </div>
          </div>

          {/* Stat card */}
          <div
            className="rounded-lg p-3"
            style={{ backgroundColor: abg('neutral', 2), border: `1px solid ${p.neutral[6]}` }}
          >
            <p className="text-xs font-medium" style={{ color: p.neutral[9] }}>Revenue</p>
            <p className="text-2xl font-bold mt-1" style={{ color: p.neutral[12] }}>$12,480</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={14} style={{ color: p.success[9] }} />
              <span className="text-xs font-medium" style={{ color: p.success[9] }}>+12.5%</span>
              <span className="text-xs" style={{ color: p.neutral[9] }}>vs. last month</span>
            </div>
          </div>
        </div>

        {/* Typography */}
        <h3 className="text-xs font-medium mb-3" style={{ color: p.neutral[11] }}>Typography</h3>
        <div className="space-y-1.5">
          <p className="text-lg font-bold" style={{ color: p.neutral[12] }}>Heading text</p>
          <p className="text-sm" style={{ color: p.neutral[11] }}>
            Body text with a{' '}
            <a href="#" className="underline" style={{ color: p.brand[9] }} onClick={e => e.preventDefault()}>
              brand link
            </a>{' '}
            inside the paragraph.
          </p>
          <p className="text-xs" style={{ color: p.neutral[9] }}>Muted caption text for secondary information.</p>
          <p className="text-sm">
            <span
              className="px-1 rounded"
              style={{ backgroundColor: abg('brand', 3), color: p.brand[11] }}
            >
              Highlighted text
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}
