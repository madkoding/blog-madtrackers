"use client";

import { useCallback, useState } from "react";
import { useLang } from "../../lang-context";
import { translations } from "../../i18n";

interface TutorialVideo {
  id: string;
  title: string;
  description: string;
}

const TutorialVideosCarousel = () => {
  const { lang } = useLang();
  const t = translations[lang];
  const videos = t.tutorialVideos as readonly TutorialVideo[];
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!videos?.length) {
    return null;
  }

  const safeIndex = ((currentIndex % videos.length) + videos.length) % videos.length;
  const currentVideo = videos[safeIndex];

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  }, [videos.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  }, [videos.length]);

  const handleSelect = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const formattedIndex = (safeIndex + 1).toString().padStart(2, "0");

  return (
    <section className="bg-slate-950 py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 flex flex-col gap-8 text-white lg:order-1">
            {/* <div>
              <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-blue-200 shadow-sm">
                YouTube
              </span>
              <h2 className="mt-6 text-3xl font-bold leading-tight md:text-4xl">
                {t.tutorialsSectionTitle}
              </h2>
              <p className="mt-4 max-w-xl text-base text-gray-300 md:text-lg">
                {t.tutorialsSectionSubtitle}
              </p>
            </div> */}

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-200">
                {formattedIndex} • {t.tutorialWatchNow}
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-white md:text-3xl">
                {currentVideo.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-gray-300 md:text-lg">
                {currentVideo.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-blue-400/60 hover:bg-white/20"
                  aria-label={t.tutorialPrevious}
                >
                  <span>{t.tutorialPrevious}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-4 w-4 rotate-180 transform transition-transform group-hover:-translate-x-0.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="group inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/90 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-500"
                  aria-label={t.tutorialNext}
                >
                  <span>{t.tutorialNext}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-4 w-4 transform transition-transform group-hover:translate-x-0.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid gap-3">
              {videos.map((video, index) => {
                const isActive = index === safeIndex;
                return (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => handleSelect(index)}
                    aria-pressed={isActive}
                    className={`group flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                      isActive
                        ? "border-blue-400 bg-white text-slate-900 shadow-lg"
                        : "border-white/10 bg-white/5 text-white hover:border-blue-300/70 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`${
                          isActive ? "text-blue-600" : "text-blue-300"
                        } text-sm font-semibold`}
                      >
                        {(index + 1).toString().padStart(2, "0")}
                      </span>
                      <span
                        className={`text-sm font-medium md:text-base ${
                          isActive ? "text-slate-900" : "text-white"
                        }`}
                      >
                        {video.title}
                      </span>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className={`h-5 w-5 transition-transform ${
                        isActive
                          ? "text-blue-600"
                          : "text-blue-200 group-hover:translate-x-1"
                      }`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="order-1 w-full lg:order-2">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/80 shadow-2xl">
              <div className="aspect-video">
                <iframe
                  key={currentVideo.id}
                  src={`https://www.youtube.com/embed/${currentVideo.id}?rel=0`}
                  title={currentVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  className="h-full w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TutorialVideosCarousel;
