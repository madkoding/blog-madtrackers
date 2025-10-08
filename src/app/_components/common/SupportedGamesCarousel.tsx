"use client";

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useLang } from '@/app/lang-context';

interface Game {
  name: string;
  logo: string;
  steamUrl: string;
  steamAppId: string;
}

const games: Game[] = [
  {
    name: 'VRChat',
    logo: '/assets/games/vrchat.png',
    steamUrl: 'https://store.steampowered.com/app/438100',
    steamAppId: '438100'
  },
  {
    name: 'Resonite',
    logo: '/assets/games/resonite.png',
    steamUrl: 'https://store.steampowered.com/app/2519830',
    steamAppId: '2519830'
  },
  {
    name: 'ChilloutVR',
    logo: '/assets/games/chillout-vr.png',
    steamUrl: 'https://store.steampowered.com/app/661130',
    steamAppId: '661130'
  },
  {
    name: 'Blade & Sorcery',
    logo: '/assets/games/blade-and-sorcery.png',
    steamUrl: 'https://store.steampowered.com/app/629730',
    steamAppId: '629730'
  },
  {
    name: 'Dragon Fist: VR Kung Fu',
    logo: '/assets/games/dragon-fist.png',
    steamUrl: 'https://store.steampowered.com/app/1481780',
    steamAppId: '1481780'
  },
  {
    name: 'Sairento VR',
    logo: '/assets/games/sairento-vr.png',
    steamUrl: 'https://store.steampowered.com/app/555880',
    steamAppId: '555880'
  },
  {
    name: 'Dance Dash',
    logo: '/assets/games/dance-dash.png',
    steamUrl: 'https://store.steampowered.com/app/2005050',
    steamAppId: '2005050'
  },
  {
    name: 'Holodance',
    logo: '/assets/games/holodance.png',
    steamUrl: 'https://store.steampowered.com/app/422860',
    steamAppId: '422860'
  },
  {
    name: 'VRWorkout',
    logo: '/assets/games/vrworkout.png',
    steamUrl: 'https://store.steampowered.com/app/1346850',
    steamAppId: '1346850'
  },
  {
    name: 'Final Soccer VR',
    logo: '/assets/games/final-soccer-vr.png',
    steamUrl: 'https://store.steampowered.com/app/555060',
    steamAppId: '555060'
  },
  // {
  //   name: 'Tornuffalo',
  //   logo: '/assets/games/tornuffalo.png',
  //   steamUrl: 'https://store.steampowered.com/app/534720',
  //   steamAppId: '534720'
  // },
  // {
  //   name: 'VR Monster Awakens',
  //   logo: '/assets/games/vr-monster-awakens.png',
  //   steamUrl: 'https://store.steampowered.com/app/566870',
  //   steamAppId: '566870'
  // },
  // {
  //   name: 'Climbey',
  //   logo: '/assets/games/climbey.png',
  //   steamUrl: 'https://store.steampowered.com/app/520010',
  //   steamAppId: '520010'
  // }
];

export default function SupportedGamesCarousel() {
  const { lang } = useLang();
  const firstRowRef = useRef<HTMLDivElement>(null);
  const secondRowRef = useRef<HTMLDivElement>(null);

  const translations = {
    es: {
      title: 'Juegos Compatibles con Full Body Tracking',
      subtitle: 'Mejora tu experiencia en estos juegos populares de VR con nuestros trackers SlimeVR'
    },
    en: {
      title: 'Full Body Tracking Compatible Games',
      subtitle: 'Enhance your experience in these popular VR games with our SlimeVR trackers'
    }
  };

  const t = translations[lang as keyof typeof translations];

  useEffect(() => {
    const firstRow = firstRowRef.current;
    const secondRow = secondRowRef.current;
    if (!firstRow || !secondRow) return;

    let animationId: number;
    let lastTime = 0;
    const speed = 0.5; // pixels por frame

    const animate = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;

      if (firstRow && secondRow) {
        // Primera fila se mueve hacia la derecha
        firstRow.scrollLeft += speed * (deltaTime / 16);
        
        // Reiniciar el scroll cuando llegue al final
        if (firstRow.scrollLeft >= firstRow.scrollWidth - firstRow.clientWidth) {
          firstRow.scrollLeft = 0;
        }

        // Segunda fila se mueve hacia la izquierda (dirección opuesta)
        secondRow.scrollLeft -= speed * (deltaTime / 16);
        
        // Reiniciar el scroll cuando llegue al inicio
        if (secondRow.scrollLeft <= 0) {
          secondRow.scrollLeft = secondRow.scrollWidth - secondRow.clientWidth;
        }
      }

      lastTime = currentTime;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    
    // Inicializar la segunda fila al final para que se mueva hacia la izquierda
    secondRow.scrollLeft = secondRow.scrollWidth - secondRow.clientWidth;

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Dividir juegos en 2 filas
  const midPoint = Math.ceil(games.length / 2);
  const firstRow = games.slice(0, midPoint);
  const secondRow = games.slice(midPoint);

  const renderGameCard = (game: Game, index: number) => (
    <a
      key={`${game.steamAppId}-${index}`}
      href={game.steamUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 group"
    >
      <div className="relative w-64 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 dark:from-black/60 to-transparent z-10" />
        <Image
          src={game.logo}
          alt={game.name}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 256px, 256px"
        />
        {/* <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <h3 className="text-white font-semibold text-sm truncate drop-shadow-lg">
            {game.name}
          </h3>
        </div> */}
        {/* Overlay de hover */}
        <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors duration-300 z-20" />
      </div>
    </a>
  );

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t.title}
          </h2>
          {/* <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t.subtitle}
          </p> */}
        </div>

        <div className="relative">
          {/* Primera fila */}
          <div 
            ref={firstRowRef}
            className="overflow-x-hidden relative mb-4"
            style={{ 
              maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
            }}
          >
            <div className="flex gap-8 py-4">
              {/* Duplicamos los juegos para crear un efecto de loop infinito */}
              {[...firstRow, ...firstRow, ...firstRow].map((game, index) => renderGameCard(game, index))}
            </div>
          </div>
          
          {/* Segunda fila */}
          <div 
            ref={secondRowRef}
            className="overflow-x-hidden relative"
            style={{ 
              maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
            }}
          >
            <div className="flex gap-8 py-4">
              {/* Duplicamos los juegos para crear un efecto de loop infinito */}
              {[...secondRow, ...secondRow, ...secondRow].map((game, index) => renderGameCard(game, index + firstRow.length))}
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}
