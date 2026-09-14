'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Star, Clock } from 'lucide-react';

export function VerticalCard({ vertical }: { vertical: any }) {
  return (
    <Link href={`/catalog/${vertical.id || vertical.label.toLowerCase()}`}>
      <Card className="overflow-hidden transition-all hover:-translate-y-1 cursor-pointer bg-background border-border shadow-sm">
        <div className="h-32 bg-gray-200">
           {/* Placeholder for image */}
           <div className="w-full h-full bg-slate-300 flex items-center justify-center">Image</div>
        </div>
        <div className="p-3">
          <p className="font-bold text-sm">{vertical.label}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {vertical.rating || '4.5'}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {vertical.deliveryTime || '30 mins'}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
