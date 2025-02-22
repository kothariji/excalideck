import { Deck, Slide } from "@excalideck/deck";
import { canvasSlideRenderer } from "@excalideck/slide-renderers";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { useDebounce } from "use-debounce";
import { isCanvasRendered, renderCanvas } from "./canvasUtils";
import "./index.css";
import slideCanvasCache from "./slideCanvasCache";

interface Props {
    deck: Deck;
    slide: Slide;
    slideIndex: number;
}
export default function SlideMiniatureImage({ deck, slide }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    const [debouncedDeck] = useDebounce(deck, 500);
    const [debouncedSlide] = useDebounce(slide, 500);

    useEffect(() => {
        // When no canvas has been rendered yet (i.e. it's the first render),
        // and there is a cached canvas, render it
        if (!isCanvasRendered(containerRef)) {
            const cachedSlideCanvas = slideCanvasCache.get(debouncedSlide.id);
            if (cachedSlideCanvas) {
                renderCanvas(containerRef, cachedSlideCanvas);
            }
        }

        // Update the canvas cache and re-render the canvas. This operation is
        // deferred to avoid blocking other more important work, like switching
        // view
        setTimeout(() => {
            const cachedSlideCanvas = slideCanvasCache.get(debouncedSlide.id);
            const updatedSlideCanvas = canvasSlideRenderer.renderSlide(
                debouncedDeck,
                debouncedSlide.id
            );
            if (updatedSlideCanvas !== cachedSlideCanvas) {
                renderCanvas(containerRef, updatedSlideCanvas);
                slideCanvasCache.set(debouncedSlide.id, updatedSlideCanvas);
            }
        }, 0);
    }, [debouncedDeck, debouncedSlide]);

    const slideAspectRatio =
        deck.printableArea.width / deck.printableArea.height;
    const miniatureAspectRatio = 3 / 2;
    return (
        <div
            ref={containerRef}
            className={clsx(
                "SlideMiniatureImage",
                slideAspectRatio < miniatureAspectRatio
                    ? "HeightCappedSlideMiniatureImage"
                    : "WidthCappedSlideMiniatureImage"
            )}
        />
    );
}
