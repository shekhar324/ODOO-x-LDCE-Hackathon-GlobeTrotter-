import React from "react";

interface DestinationCard {
  id: string;
  title: string;
  country: string;
  tag: string;
  image: string;
  subtitle: string;
}

interface HeroServiceCardProps {
  card: DestinationCard;
  onClick?: () => void;
}

export function HeroServiceCard({ card, onClick }: HeroServiceCardProps) {
  return (
    <div
      onClick={onClick}
      className="w-[300px] sm:w-[380px] h-[480px] sm:h-[530px] bg-[#1f1f1f] rounded-none relative snap-center flex-shrink-0 group overflow-hidden border border-[#353535] cursor-pointer"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.image}
        alt={card.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none" />

      <div className="absolute top-6 left-6 z-10">
        <span className="text-xs text-white border border-white/30 px-3.5 py-1.5 rounded-full backdrop-blur-sm font-normal">
          {card.tag}
        </span>
      </div>

      <div className="absolute bottom-6 left-6 right-6 z-10 text-left">
        <h3 className="font-serif text-2xl text-white font-light mb-1">
          {card.title}
        </h3>
        <p className="font-sans text-xs text-neutral-300 opacity-90 line-clamp-2">
          {card.subtitle}
        </p>
      </div>
    </div>
  );
}
