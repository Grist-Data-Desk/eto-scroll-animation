import { scaleLinear, scaleThreshold } from "d3-scale";
import { scroll } from "motion";

// Constants.
const FRAME_COUNT = 364;

/**
 * Get the current frame from the image sequence based on the index derived from
 * the progress of the scroll.
 *
 * @param path — The path to the image sequence files.
 * @param index — The index of the current frame, based on the progress of the
 * scroll.
 * @returns The path to the current frame.
 */
function getCurrentFrame(path: string, index: number): string {
  return `${import.meta.env.BASE_URL}${path}${index.toString().padStart(3, "0")}.webp`;
}

/**
 * Update the src attribute of the image element with the current frame in the
 * image sequence.
 *
 * @param img – The image element to update.
 * @param src – The path to the image sequence files.
 * @param index – The index of the current frame, based on the progress of the
 * scroll.
 */
function updateImage(img: HTMLImageElement, src: string, index: number): void {
  img.src = getCurrentFrame(src, index);
}

/**
 * Preload the remaining frames of the image sequence.
 *
 * @param src – The path to the image sequence files.
 * @param frameCount – The total number of frames in the image sequence.
 */
function preloadImages(src: string, frameCount: number) {
  for (let i = 1; i < frameCount; i++) {
    const img = new Image();
    img.src = getCurrentFrame(src, i);
  }
}

/**
 * Derive parameters for the image sequence based on the viewport width.
 */
function deriveImageParams() {
  if (window.matchMedia("(min-width: 1024px)").matches) {
    return {
      path: "Desktop/Truck-Export-Desktop",
      dimensions: {
        width: 2880,
        height: 1620,
      },
    };
  } else if (window.matchMedia("(min-width: 768px)").matches) {
    return {
      path: "Tablet/Truck-Export-Tablet",
      dimensions: {
        width: 1668,
        height: 2388,
      },
    };
  } else {
    return {
      path: "Mobile/Truck-Export-Mobile",
      dimensions: {
        width: 1179,
        height: 2556,
      },
    };
  }
}

const BREAKS = [70 / FRAME_COUNT, 170 / FRAME_COUNT];
const GAP = 0.0375;

// Scales for annotation animation.
const annotationTextScale = scaleThreshold<number, string>()
  .domain(BREAKS)
  .range([
    "After medical products are sterilized with ethylene oxide, they're packaged and loaded onto trucks.",
    "While the products are being transported to warehouses, ethylene oxide off-gases and builds up inside the truck.",
    "When the trucks arrive at warehouses and the products are moved inside, the built-up ethylene oxide escapes from the truck as the sterilized products continue to off-gas.",
  ]);
const annotationOpacityScale = scaleLinear()
  .domain([
    0,
    ...BREAKS.flatMap((b) => [b - 2 * GAP, b - GAP, b, b + GAP, b + 2 * GAP]),
    0.975,
    1,
  ])
  .range([1, ...BREAKS.flatMap(() => [1, 0, 0, 0, 1]), 1, 0]);

/**
 * Update the annotation text and opacity based on the progress of the scroll.
 *
 * @param annotation – The annotation element to update.
 * @param progress – The progress of the scroll.
 */
function updateAnnotation(annotation: HTMLSpanElement, progress: number) {
  annotation.textContent = annotationTextScale(progress);
  annotation.style.opacity = annotationOpacityScale(progress).toString();
}

/**
 * The top-level main function.
 *
 * This function initializes the canvas element,
 * sets the dimensions of the canvas, and loads the first frame of the image se-
 * quence. In addition, we preload the remaining frames of the image sequence
 * and set up the scroll handler.
 */
function main() {
  const canvas = document.getElementById("scrolly-canvas") as HTMLCanvasElement;
  const annotation = document.getElementById(
    "scrolly-annotation",
  ) as HTMLSpanElement;

  const ctx = canvas.getContext("2d");
  const {
    path,
    dimensions: { width, height },
  } = deriveImageParams();
  canvas.width = width;
  canvas.height = height;

  const img = new Image();
  img.src = getCurrentFrame(path, 0);
  img.onload = () => {
    if (!ctx) {
      return;
    }

    ctx.drawImage(img, 0, 0);
  };

  preloadImages(path, FRAME_COUNT);

  document.addEventListener("DOMContentLoaded", () => {
    scroll(
      (progress: number) => {
        if (!ctx) {
          return;
        }

        const frameIndex = Math.min(
          FRAME_COUNT - 1,
          Math.floor(progress * FRAME_COUNT),
        );

        requestAnimationFrame(() => updateImage(img, path, frameIndex));
        updateAnnotation(annotation, progress);
      },
      { target: document.getElementById("scrolly-content")! as HTMLDivElement },
    );
  });
}

main();
