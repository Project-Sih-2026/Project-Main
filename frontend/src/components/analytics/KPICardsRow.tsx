import React from 'react';
import { Activity, Car, Camera, AlertCircle } from 'lucide-react';
import { AnalyticsKPIs } from '../../types';

interface KPIRowProps {
  kpis: AnalyticsKPIs | null;
  onCardClick?: (type: string) => void;
}

export const KPICardsRow: React.FC<KPIRowProps> = ({ kpis, onCardClick }) => {
  const cards = [
    {
      id: 'detections',
      label: 'Total Detection Events',
      value: kpis?.total_detection_events ?? 248,
      subtext: 'Across all active city cameras',
      icon: Activity,
      color: 'text-[#0B2545]',
      badgeBg: 'bg-[#8FBCE6]/30 text-[#0B2545]'
    },
    {
      id: 'unique_plates',
      label: 'Unique Normalized Plates',
      value: kpis?.unique_normalized_plates ?? 184,
      subtext: 'Distinct vehicles observed',
      icon: Car,
      color: 'text-[#0B2545]',
      badgeBg: 'bg-[#6FA8DC]/30 text-[#0B2545]'
    },
    {
      id: 'cameras',
      label: 'Active Camera Nodes',
      value: `${kpis?.active_cameras_count ?? 6} / 6`,
      subtext: 'Operational CCTV feeds',
      icon: Camera,
      color: 'text-[#0B2545]',
      badgeBg: 'bg-[#D2DEEC] text-[#0B2545]'
    },
    {
      id: 'review_required',
      label: 'Review Required Queue',
      value: kpis?.review_required_count ?? 0,
      subtext: 'Low confidence / unverified',
      icon: AlertCircle,
      color: (kpis?.review_required_count || 0) > 0 ? 'text-[#E86A67]' : 'text-[#42C98A]',
      badgeBg: (kpis?.review_required_count || 0) > 0 ? 'bg-[#E86A67]/20 text-[#E86A67]' : 'bg-[#42C98A]/20 text-[#42C98A]'
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-4 select-none">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onCardClick && onCardClick(card.id)}
            className="p-4 rounded-2xl bg-white border border-[#E3EAF3] shadow-md hover:shadow-lg hover:border-[#32193A] transition duration-150 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5B6E8C]">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl ${card.badgeBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-black tracking-tight text-[#081A33]">
                {card.value}
              </span>
            </div>

            <p className="text-[11px] text-[#5B6E8C] mt-1">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};
