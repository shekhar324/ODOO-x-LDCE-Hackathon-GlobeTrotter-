import React from "react";
import Link from "next/link";
import { IconPlaneDeparture } from "@tabler/icons-react";

interface BoardingPassProps {
  id?: string;
  flight: string;
  destination: string;
  date: string;
  passenger: string;
  fromCode: string;
  toCode: string;
  gate: string;
  seat: string;
  image: string;
  href?: string;
}

export function BoardingPassCard({
  flight,
  destination,
  date,
  passenger,
  fromCode,
  toCode,
  gate,
  seat,
  image,
  href = "/itinerary/kyoto-autumn-retreat",
}: BoardingPassProps) {
  return (
    <Link 
      href={href}
      className="min-w-[85vw] md:min-w-[650px] bg-white text-black relative snap-center group cursor-pointer shrink-0 shadow-2xl flex rounded-xl overflow-hidden hover:opacity-95 transition-opacity"
    >
      {/* Left Stub */}
      <div className="w-1/3 border-r-2 border-dashed border-black/20 p-6 flex flex-col justify-between bg-[#e4e9dc]/30">
        <div>
          <div className="text-xs font-bold tracking-widest text-neutral-500 mb-1">FLIGHT</div>
          <div className="font-sans text-xl font-bold mb-6">{flight}</div>
          <div className="text-xs font-bold tracking-widest text-neutral-500 mb-1">DESTINATION</div>
          <div className="font-serif text-2xl leading-tight">{destination}</div>
        </div>
        <div className="font-mono uppercase tracking-widest text-[#93000a] font-bold text-lg opacity-70 -rotate-3">
          {date}
        </div>
      </div>
      
      {/* Right Main */}
      <div className="w-2/3 flex">
        <div className="w-1/2 p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold tracking-widest text-neutral-500 mb-1">PASSENGER</div>
            <div className="font-sans text-sm font-bold mb-6 uppercase">{passenger}</div>
            
            <div className="flex gap-4 mb-6">
              <div>
                <div className="text-xs font-bold tracking-widest text-neutral-500 mb-1">FROM</div>
                <div className="font-sans text-2xl font-bold">{fromCode}</div>
              </div>
              <div className="flex items-center text-neutral-400">
                <IconPlaneDeparture className="w-6 h-6" stroke={1.5} />
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest text-neutral-500 mb-1">TO</div>
                <div className="font-sans text-2xl font-bold">{toCode}</div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-6">
            <div>
              <div className="text-xs font-bold tracking-widest text-neutral-500 mb-1">GATE</div>
              <div className="font-sans text-sm font-bold">{gate}</div>
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest text-neutral-500 mb-1">SEAT</div>
              <div className="font-sans text-sm font-bold">{seat}</div>
            </div>
          </div>
        </div>
        
        {/* Image Right */}
        <div className="w-1/2 relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={destination}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
      </div>
    </Link>
  );
}
