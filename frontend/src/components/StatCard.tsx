import type { IconType } from 'react-icons';

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: IconType;
  tone?: 'teal' | 'slate' | 'red';
};

const toneMap = {
  teal: 'text-[#003d4c]',
  slate: 'text-[#41484b]',
  red: 'text-error',
};

export function StatCard({ label, value, detail, icon: Icon, tone = 'teal' }: StatCardProps) {
  return (
    <div className="stat-card flex flex-col justify-between">
      <div className="mb-3 flex items-center justify-between">
        <span className="muted-label">{label}</span>
        <Icon className={toneMap[tone]} />
      </div>
      <div>
        <div className="text-4xl font-bold tracking-tight text-[#1b1c1c]">{value}</div>
        <div className="mt-1 text-sm text-[#41484b]">{detail}</div>
      </div>
    </div>
  );
}
