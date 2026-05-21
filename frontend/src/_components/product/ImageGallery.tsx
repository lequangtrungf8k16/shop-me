"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageGalleryProps {
   thumbnail: string;
   images: string[];
   productName: string;
}

export default function ImageGallery({ thumbnail, images, productName }: ImageGalleryProps) {
   // Gộp thumbnail và images thành một mảng
   const allImages = [thumbnail, ...(images || [])].filter(Boolean);
   const [currentIndex, setCurrentIndex] = useState(0);

   return (
      <div className="flex flex-col gap-stack-default">
         <div className="w-full aspect-4/3 bg-surface-container rounded-lg border border-surface-container-high overflow-hidden relative group flex items-center justify-center p-4">
            <Image
               src={allImages[currentIndex] || "https://picsum.photos/800/600"}
               alt={productName}
               fill
               className="object-contain transition-transform duration-700 group-hover:scale-105 p-4"
               sizes="(max-width: 1024px) 100vw, 60vw"
               priority
            />
         </div>
         {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
               {allImages.map((img, idx) => (
                  <button
                     key={idx}
                     onClick={() => setCurrentIndex(idx)}
                     className={`relative w-20 h-16 shrink-0 bg-surface-container rounded border-2 overflow-hidden transition-colors ${
                        idx === currentIndex
                           ? "border-primary"
                           : "border-surface-container-high hover:border-primary/50"
                     }`}
                  >
                     <Image
                        src={img}
                        fill
                        alt={`Thumb ${idx + 1}`}
                        className="object-cover"
                     />
                  </button>
               ))}
               <div className="w-20 h-16 shrink-0 bg-surface-container rounded border border-surface-container-high cursor-pointer overflow-hidden hover:border-primary transition-colors flex items-center justify-center text-on-surface-variant">
                  <span className="font-bold text-[12px]">360°</span>
               </div>
               <div className="w-20 h-16 shrink-0 bg-surface-container rounded border border-surface-container-high cursor-pointer overflow-hidden hover:border-primary transition-colors flex items-center justify-center text-on-surface-variant">
                  <span className="font-bold text-[12px]">Video</span>
               </div>
            </div>
         )}
         {allImages.length <= 1 && (
            <div className="grid grid-cols-4 gap-stack-default">
               <div className="aspect-video relative bg-surface-container rounded border-2 border-primary cursor-pointer overflow-hidden">
                  <Image
                     src={allImages[0] || "https://picsum.photos/800/600"}
                     fill
                     alt="Thumb 1"
                     className="object-cover"
                  />
               </div>
               <div className="aspect-video bg-surface-container rounded border border-surface-container-high cursor-pointer overflow-hidden hover:border-primary transition-colors flex items-center justify-center text-on-surface-variant">
                  <span className="font-bold">360°</span>
               </div>
               <div className="aspect-video bg-surface-container rounded border border-surface-container-high cursor-pointer overflow-hidden hover:border-primary transition-colors flex items-center justify-center text-on-surface-variant">
                  <span className="font-bold">Video</span>
               </div>
            </div>
         )}
      </div>
   );
}
