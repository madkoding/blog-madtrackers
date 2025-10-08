"use client";

import { useLang } from "../../lang-context";
import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

interface Country {
  name: string;
  code: string; // Código ISO del país
  link: string;
  flag: string;
  shipping: "free" | "ups";
}

interface CountryPosition {
  css: { x: number; y: number };
  svg: { x: number; y: number };
}

const SVG_HEIGHT = 58.5;
const PLANE_ROTATION_OFFSET = 90;
const FRAME_INTERVAL = 1000 / 30; // 30 FPS para reducir uso de CPU
const HIGHLIGHT_COLOR = "#22d3ee";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const computeRouteControl = (origin: CountryPosition, target: CountryPosition) => {
  const originSvg = origin.svg;
  const targetSvg = target.svg;
  const midX = (originSvg.x + targetSvg.x) / 2;
  const distance = Math.hypot(targetSvg.x - originSvg.x, targetSvg.y - originSvg.y);
  const curveOffset = Math.min(distance * 0.3, 12);
  const controlSvgY = clamp((originSvg.y + targetSvg.y) / 2 - curveOffset, 0, SVG_HEIGHT);

  return {
    svg: { x: midX, y: controlSvgY },
    css: { x: midX, y: (controlSvgY / SVG_HEIGHT) * 100 },
  };
};

const quadraticBezier = (p0: number, p1: number, p2: number, t: number) => {
  const oneMinusT = 1 - t;
  return oneMinusT * oneMinusT * p0 + 2 * oneMinusT * t * p1 + t * t * p2;
};

const quadraticBezierDerivative = (p0: number, p1: number, p2: number, t: number) => {
  const oneMinusT = 1 - t;
  return 2 * oneMinusT * (p1 - p0) + 2 * t * (p2 - p1);
};

const ShippingCountries = () => {
  const { lang } = useLang();
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [currentDestination, setCurrentDestination] = useState(0);
  const [countryPositions, setCountryPositions] = useState<Record<string, CountryPosition>>({});
  const [mapMarkup, setMapMarkup] = useState<string | null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);

  // Países con sus códigos ISO 3166-1 alpha-2 (deben coincidir con los IDs del SVG)
  const countries: Country[] = useMemo(() => ([
    { name: "Chile", code: "cl", link: "/trackers-slimevr-chile", flag: "🇨🇱", shipping: "free" },
    { name: "Argentina", code: "ar", link: "/trackers-slimevr-argentina", flag: "🇦🇷", shipping: "ups" },
    { name: "México", code: "mx", link: "/trackers-slimevr-mexico", flag: "🇲🇽", shipping: "ups" },
    { name: "Colombia", code: "co", link: "/posts/Envios_Internacionales_Trackers_SlimeVR", flag: "🇨🇴", shipping: "ups" },
    { name: "Perú", code: "pe", link: "/posts/Envios_Internacionales_Trackers_SlimeVR", flag: "🇵🇪", shipping: "ups" },
    { name: "Estados Unidos", code: "us", link: "/posts/Envios_Internacionales_Trackers_SlimeVR", flag: "🇺🇸", shipping: "ups" },
    { name: "Canadá", code: "ca", link: "/posts/Envios_Internacionales_Trackers_SlimeVR", flag: "🇨🇦", shipping: "ups" },
    { name: "España", code: "es", link: "/trackers-slimevr-espana", flag: "🇪🇸", shipping: "ups" },
    { name: "Italia", code: "it", link: "/posts/Envios_Internacionales_Trackers_SlimeVR", flag: "🇮🇹", shipping: "ups" },
    { name: "Alemania", code: "de", link: "/posts/Envios_Internacionales_Trackers_SlimeVR", flag: "🇩🇪", shipping: "ups" },
  ]), []);

  // Calcular posiciones dinámicamente usando el SVG real para asegurar precisión milimétrica
  useEffect(() => {
    if (typeof window === "undefined") return;

    const container = svgContainerRef.current;
    if (!container) return;

    let isMounted = true;

    const loadAndMeasure = async () => {
      try {
        const response = await fetch("/assets/simple-world-map.svg");
        if (!response.ok) {
          throw new Error(`No se pudo cargar el mapa: ${response.status}`);
        }

        const svgMarkup = await response.text();
        if (!isMounted) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgMarkup, "image/svg+xml");
        const svgElement = doc.querySelector("svg");

        if (!svgElement) {
          console.warn("No se pudo encontrar el elemento SVG principal");
          return;
        }

        svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svgElement.setAttribute("width", "100%");
        svgElement.setAttribute("height", "100%");
        const svgNamespace = "http://www.w3.org/2000/svg";

        let defs = svgElement.querySelector("defs");
        if (!defs) {
          defs = doc.createElementNS(svgNamespace, "defs");
          svgElement.insertBefore(defs, svgElement.firstChild);
        }

        if (!svgElement.querySelector("#cyanGlow")) {
          const glowFilter = doc.createElementNS(svgNamespace, "filter");
          glowFilter.setAttribute("id", "cyanGlow");
          glowFilter.setAttribute("x", "-40%");
          glowFilter.setAttribute("y", "-40%");
          glowFilter.setAttribute("width", "180%");
          glowFilter.setAttribute("height", "180%");

          const dropShadow = doc.createElementNS(svgNamespace, "feDropShadow");
          dropShadow.setAttribute("dx", "0");
          dropShadow.setAttribute("dy", "0");
          dropShadow.setAttribute("stdDeviation", "1.2");
          dropShadow.setAttribute("flood-color", HIGHLIGHT_COLOR);
          dropShadow.setAttribute("flood-opacity", "0.9");

          glowFilter.appendChild(dropShadow);
          defs?.appendChild(glowFilter);
        }

        svgElement.setAttribute("stroke-linejoin", "round");
        svgElement.setAttribute("stroke-linecap", "round");

        const outlineElements = svgElement.querySelectorAll("path, polyline, polygon, line");
        outlineElements.forEach((element) => {
          element.setAttribute("stroke", HIGHLIGHT_COLOR);
          if (!element.getAttribute("stroke-width")) {
            element.setAttribute("stroke-width", "0.5");
          }
          element.setAttribute("filter", "url(#cyanGlow)");
          const fillValue = element.getAttribute("fill");
          if (fillValue && fillValue !== "none") {
            element.setAttribute("fill-opacity", "0.08");
          }
        });

        const measurementSvg = svgElement.cloneNode(true) as SVGSVGElement;
        container.innerHTML = "";
        container.appendChild(measurementSvg);

        const viewBox = measurementSvg.viewBox.baseVal;
        const positions: Record<string, CountryPosition> = {};

        countries.forEach((country) => {
          const baseNode = measurementSvg.querySelector(`#${country.code}`) as SVGGraphicsElement | null;
          let node: SVGGraphicsElement | null = baseNode;

          if (baseNode instanceof SVGGElement) {
            const mainland = baseNode.querySelector<SVGGraphicsElement>(".mainland");
            if (mainland) {
              node = mainland;
            }
          }

          if (!node) {
            console.warn(`No se encontró el país ${country.name} (${country.code}) en el mapa`);
            return;
          }

          try {
            const { x, y, width, height } = node.getBBox();
            const centerX = x + width / 2;
            const centerY = y + height / 2;

            const percentX = ((centerX - viewBox.x) / viewBox.width) * 100;
            const percentY = ((centerY - viewBox.y) / viewBox.height) * 100;

            positions[country.code] = {
              css: {
                x: percentX,
                y: percentY,
              },
              svg: {
                x: percentX,
                y: (percentY / 100) * SVG_HEIGHT,
              },
            };
          } catch (error) {
            console.warn(`No se pudo calcular el bounding box para ${country.name}`, error);
          }
        });

        const chilePosition = positions["cl"];
        if (chilePosition) {
          const correctedX = 27;
          positions["cl"] = {
            css: {
              x: correctedX,
              y: chilePosition.css.y,
            },
            svg: {
              x: correctedX,
              y: chilePosition.svg.y,
            },
          };
        }

        if (isMounted) {
          setCountryPositions(positions);
          setMapMarkup(svgElement.outerHTML);
        }

        container.innerHTML = "";
      } catch (error) {
        console.error("Error al procesar el mapa SVG", error);
      }
    };

    loadAndMeasure();

    return () => {
      isMounted = false;
      container.innerHTML = "";
    };
  }, [countries]);

  // Animación del avión
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDestination((prev) => {
        const nextDestination = (prev + 1) % countries.length;
        return nextDestination === 0 ? 1 : nextDestination; // Saltamos Chile
      });
    }, 3000); // Cambia de destino cada 3 segundos

    return () => clearInterval(interval);
  }, [countries]);

  // Actualizar posición y rotación del avión siguiendo la misma curva que las rutas
  useEffect(() => {
    const origin = countryPositions[countries[0].code];
    const destination = countryPositions[countries[currentDestination].code];
    const planeEl = planeRef.current;

    if (!origin || !destination || !planeEl) return;

  const control = computeRouteControl(origin, destination);
  const duration = 5000;
  const startTime = performance.now();
  let lastFrameTime = startTime;

    const applyPlaneStyles = (x: number, y: number, angleDeg: number) => {
      planeEl.style.left = `${x}%`;
      planeEl.style.top = `${y}%`;
      planeEl.style.transform = `translate(-50%, -50%) rotate(${angleDeg + PLANE_ROTATION_OFFSET}deg)`;
    };

    const initialDx = quadraticBezierDerivative(origin.svg.x, control.svg.x, destination.svg.x, 0);
    const initialDy = quadraticBezierDerivative(origin.svg.y, control.svg.y, destination.svg.y, 0);
    applyPlaneStyles(origin.css.x, origin.css.y, (Math.atan2(initialDy, initialDx) * 180) / Math.PI);

    let currentFrameId = 0;

    const animate = () => {
      const now = performance.now();
      if (now - lastFrameTime < FRAME_INTERVAL) {
        currentFrameId = requestAnimationFrame(animate);
        return;
      }

      lastFrameTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const xCss = quadraticBezier(origin.css.x, control.css.x, destination.css.x, easeProgress);
      const yCss = quadraticBezier(origin.css.y, control.css.y, destination.css.y, easeProgress);
      const dxSvg = quadraticBezierDerivative(origin.svg.x, control.svg.x, destination.svg.x, easeProgress);
      const dySvg = quadraticBezierDerivative(origin.svg.y, control.svg.y, destination.svg.y, easeProgress);

      applyPlaneStyles(xCss, yCss, (Math.atan2(dySvg, dxSvg) * 180) / Math.PI);

      if (progress < 1) {
        currentFrameId = requestAnimationFrame(animate);
      }
    };

    currentFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(currentFrameId);
    };
  }, [currentDestination, countryPositions, countries]);

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-800 py-12">
      <div className="container mx-auto px-4">
  <div className="w-full bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="p-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {lang === 'es' ? 'Envíos Internacionales' : 'International Shipping'}
              </h2>
              <p className="text-cyan-300 mb-6">
                {lang === 'es'
                  ? 'Desde Chile hacia el mundo via UPS'
                  : 'From Chile to the world via UPS'}
              </p>

              <div className="grid grid-cols-5 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-3">
                {countries.map((country) => (
                  <Link
                    key={`list-${country.code}`}
                    href={country.link}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-slate-900/40 hover:bg-slate-900/60 transition-colors sm:flex-row sm:justify-between sm:gap-3 sm:p-3"
                  >
                    <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-center sm:gap-3">
                      <span className="text-xl sm:text-2xl" aria-hidden>{country.flag}</span>
                      <span className="hidden text-white font-semibold sm:inline">{country.name}</span>
                    </div>
                    {country.code === 'cl' && (
                      <span className="hidden text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-green-500/20 text-green-300 sm:inline-flex">
                        {lang === 'es' ? 'Gratis' : 'Free'}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-6 lg:p-8">
              <div className="relative w-full aspect-[1.71/1] bg-slate-900/50 rounded-lg overflow-hidden">
                {/* Mapa SVG de fondo */}
                <div className="absolute inset-0 opacity-40">
                  {mapMarkup ? (
                    <div
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: mapMarkup }}
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <Image
                        src="/assets/simple-world-map.svg"
                        alt="World Map"
                        fill
                        className="object-contain"
                        loading="lazy"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                  )}
                </div>

                {/* Capa de overlay para líneas de ruta */}
                <svg
                  viewBox="0 0 100 58.5"
                  className="absolute inset-0 w-full h-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Líneas de ruta desde Chile con curvas */}
                  {countries.slice(1).map((country, index) => {
                    const chilePos = countryPositions[countries[0].code];
                    const countryPos = countryPositions[country.code];

                    if (!chilePos || !countryPos) return null;

                    const origin = chilePos.svg;
                    const target = countryPos.svg;
                    const control = computeRouteControl(chilePos, countryPos);

                    return (
                      <path
                        key={`route-${country.name}`}
                        d={`M ${origin.x} ${origin.y} Q ${control.svg.x} ${control.svg.y} ${target.x} ${target.y}`}
                        fill="none"
                        stroke={currentDestination === index + 1 ? "rgba(6, 182, 212, 0.8)" : "rgba(6, 182, 212, 0.3)"}
                        strokeWidth={currentDestination === index + 1 ? "0.4" : "0.2"}
                        strokeDasharray="2,1"
                        style={{
                          transition: 'all 0.3s ease'
                        }}
                      >
                      </path>
                    );
                  })}
                </svg>

                {/* Puntos de países superpuestos */}
                {countries.map((country) => {
                  const position = countryPositions[country.code];
                  if (!position) return null;

                  return (
                    <div
                      key={country.name}
                      className="absolute group cursor-pointer z-30"
                      style={{
                        left: `${position.css.x}%`,
                        top: `${position.css.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      onMouseEnter={() => setHoveredCountry(country.name)}
                      onMouseLeave={() => setHoveredCountry(null)}
                    >
                      {/* Punto brillante */}
                      <div className="relative">
                        <div className={`w-3.5 h-3.5 rounded-full ${
                          country.shipping === 'free'
                            ? 'bg-green-400'
                            : 'bg-cyan-400'
                        }`} />
                      </div>

                      {/* Tooltip */}
                      {hoveredCountry === country.name && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-slate-800/95 rounded-lg whitespace-nowrap z-50">
                          <div className="text-white font-semibold text-sm flex items-center gap-2">
                            <span className="text-xl">{country.flag}</span>
                            {country.name}
                            {country.shipping === 'free' && (
                              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                                {lang === 'es' ? 'GRATIS' : 'FREE'}
                              </span>
                            )}
                          </div>
                          {/* Flecha del tooltip */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                            <div className="border-[6px] border-transparent border-t-slate-800/95" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Avión animado */}
                <div
                  ref={planeRef}
                  className="absolute w-10 h-10 z-40 pointer-events-none will-change-transform"
                  style={{ left: "0%", top: "0%", transform: "translate(-50%, -50%)" }}
                >
                  <svg viewBox="0 0 24 24" className="w-full h-full text-cyan-300">
                    <path
                      fill="currentColor"
                      d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={svgContainerRef}
        aria-hidden="true"
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      />

      {/* Estilos para la animación de las líneas */}
      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
      `}</style>
    </div>
  );
};

export default ShippingCountries;
