import React from "react";
import Link from "next/link";
import { IconHeart, IconArrowRight, IconCoins, IconTrendingUp } from "@tabler/icons-react";
import { EditorialHeading } from "./editorial-heading";

interface DestinationCardProps {
  id?: string;
  title: string;
  location: string;
  description: string;
  image: string;
  tags: string[];
  costIndex: string;
  popularity: string;
  href?: string;
}

export function DestinationCard({
  title,
  location,
  description,
  image,
  tags,
  costIndex,
  popularity,
  href = "/itinerary/kyoto-autumn-retreat",
}: DestinationCardProps) {
  return (
    <Link href={href} className="group bg-white rounded-[15.04px] overflow-hidden border border-[#020202]/10 hover:border-[#38a454] transition-colors cursor-pointer flex flex-col h-full">
      <div className="relative h-[300px] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {tags.map(tag => (
            <span key={tag} className="bg-black/20 backdrop-blur-md border border-white/50 text-white px-3 py-1 rounded-full font-sans text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className="p-8 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <EditorialHeading as="h2" className="text-4xl text-[#020202]">{title}</EditorialHeading>
            <IconHeart className="text-[#020202] group-hover:text-[#38a454] transition-colors" stroke={1.5} />
          </div>
          <p className="font-sans text-sm text-[#020202]/60 mb-4">{location}</p>
          <p className="font-sans text-base text-[#020202] line-clamp-2">{description}</p>
        </div>
        
        <div className="mt-8 pt-4 border-t border-[#020202]/10 flex justify-between items-center text-[#020202]/70 font-sans text-sm">
          <div className="flex gap-6">
            <span className="flex items-center gap-1">
              <IconCoins className="w-4 h-4" /> Cost: {costIndex}
            </span>
            <span className="flex items-center gap-1">
              <IconTrendingUp className="w-4 h-4" /> Pop: {popularity}
            </span>
          </div>
          <IconArrowRight className="text-[#38a454] opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0 duration-300" />
        </div>
      </div>
    </Link>
  );
}
