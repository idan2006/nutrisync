import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react';

export default function GalleryModal({ photos, onClose }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col gallery-enter">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 flex-shrink-0">
        <div>
          <h2 className="text-white text-xl font-bold">Progress Gallery</h2>
          <p className="text-white/50 text-sm mt-0.5">
            {photos.length === 0 ? 'No photos yet' : `${photos.length} photo${photos.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:bg-white/20 transition"
        >
          <X size={20} className="text-white" />
        </button>
      </div>

      {/* ── Empty state ── */}
      {photos.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white/30 px-8 text-center">
          <Images size={56} strokeWidth={1} />
          <p className="text-lg font-semibold">No photos yet</p>
          <p className="text-sm leading-relaxed">
            Upload a progress photo on the Home tab and save it to the gallery to track your visual transformation.
          </p>
        </div>
      )}

      {/* ── Grid ── */}
      {photos.length > 0 && (
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-6">
          <div className="grid grid-cols-2 gap-2">
            {photos.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setExpanded(idx)}
                className="relative rounded-2xl overflow-hidden aspect-[3/4] active:opacity-80 transition"
              >
                <img src={p.url} alt="" className="w-full h-full object-cover" />
                {/* Date overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2.5">
                  <p className="text-white text-xs font-semibold">
                    {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-white/60 text-[10px]">
                    {new Date(p.date).toLocaleDateString('en-US', { year: 'numeric' })}
                  </p>
                </div>
                {/* Latest badge */}
                {idx === 0 && (
                  <span className="absolute top-2.5 left-2.5 bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Latest
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Expanded / Lightbox ── */}
      {expanded !== null && (
        <div className="absolute inset-0 bg-black z-10 flex flex-col gallery-enter">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pt-12 pb-4 flex-shrink-0">
            <button
              onClick={() => setExpanded(null)}
              className="flex items-center gap-1.5 text-white/80 text-sm font-medium"
            >
              <ChevronLeft size={18} /> Gallery
            </button>
            <p className="text-white/50 text-xs">
              {new Date(photos[expanded].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <div className="w-20" />
          </div>

          {/* Photo */}
          <div className="flex-1 flex items-center justify-center px-4">
            <img
              src={photos[expanded].url}
              alt=""
              className="max-w-full max-h-full rounded-2xl object-contain"
            />
          </div>

          {/* Prev / counter / Next */}
          <div className="flex items-center justify-between px-6 py-6 flex-shrink-0">
            <button
              onClick={() => setExpanded(e => Math.max(e - 1, 0))}
              disabled={expanded === 0}
              className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center disabled:opacity-25 active:bg-white/20 transition"
            >
              <ChevronLeft size={22} className="text-white" />
            </button>
            <span className="text-white/60 text-sm tabular-nums">
              {expanded + 1} / {photos.length}
            </span>
            <button
              onClick={() => setExpanded(e => Math.min(e + 1, photos.length - 1))}
              disabled={expanded === photos.length - 1}
              className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center disabled:opacity-25 active:bg-white/20 transition"
            >
              <ChevronRight size={22} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
