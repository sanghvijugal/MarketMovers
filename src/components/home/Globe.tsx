import * as React from "react";
import createGlobe from "cobe";

// A slowly turning globe that settles on Jabalpur. Drag to spin it; it
// eases back. Static (no spin) for reduced motion.
const JBP: [number, number] = [23.1815, 79.9864];
const NEARBY: [number, number][] = [
  [23.834, 80.394], // Katni
  [22.597, 80.371], // Mandla
  [22.915, 79.192], // Narsinghpur
  [22.085, 79.543], // Seoni
  [23.833, 79.442], // Damoh
];
// cobe's phi/theta that put a lat/long facing the viewer
const facePhi = (lng: number) => Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2);
const faceTheta = (lat: number) => (lat * Math.PI) / 180;

export default function Globe() {
  const canvas = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { phi: facePhi(JBP[1]), theta: faceTheta(JBP[0]) * 0.8 };
    let phi = reduce ? target.phi : target.phi - 2.2; // arrive from the west
    const theta = target.theta;
    let drag: number | null = null;
    let dragOffset = 0;
    let width = el.offsetWidth;
    const onResize = () => (width = el.offsetWidth);
    window.addEventListener("resize", onResize);

    const globe = createGlobe(el, {
      devicePixelRatio: Math.min(window.devicePixelRatio, 2),
      width: width * 2,
      height: width * 2,
      phi,
      theta,
      dark: 1,
      diffuse: 1.5,
      mapSamples: 18000,
      mapBrightness: 7,
      mapBaseBrightness: 0.06,
      baseColor: [0.2, 0.38, 0.39],
      markerColor: [0.79, 0.64, 0.36],
      glowColor: [0.14, 0.32, 0.33],
      markers: [{ location: JBP, size: 0.06 }, ...NEARBY.map((l) => ({ location: l, size: 0.03 }))],
    });

    // Our own frame loop (cobe v2 has no onRender); paused while off screen.
    let frame = 0;
    let visible = false;
    const tick = () => {
      if (drag === null) {
        dragOffset *= 0.92; // let go: spring back toward Jabalpur
        phi += reduce ? target.phi - phi : (target.phi - phi) * 0.025;
      }
      globe.update({ phi: phi + dragOffset, theta, width: width * 2, height: width * 2 });
      if (visible) frame = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) frame = requestAnimationFrame(tick);
    });
    io.observe(el);

    const down = (e: PointerEvent) => { drag = e.clientX; el.style.cursor = "grabbing"; el.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => { if (drag !== null) { dragOffset += (e.clientX - drag) / 180; drag = e.clientX; } };
    const up = () => { drag = null; el.style.cursor = "grab"; };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    requestAnimationFrame(() => (el.style.opacity = "1"));

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      globe.destroy();
      window.removeEventListener("resize", onResize);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      aria-label="Globe turning to show Jabalpur, in the middle of India"
      role="img"
      className="aspect-square w-full cursor-grab opacity-0 transition-opacity duration-700 [touch-action:pan-y]"
    />
  );
}
