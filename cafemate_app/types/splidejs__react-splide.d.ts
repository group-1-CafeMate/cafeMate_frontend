declare module "@splidejs/react-splide" {
  import { ComponentType } from "react";

  interface SplideOptions {
    type?: "slide" | "loop";
    rewind?: boolean;
    perPage?: number;
    perMove?: number;
    gap?: string;
    pagination?: boolean;
    arrows?: boolean;
    autoplay?: boolean;
    interval?: number;
    speed?: number;
    drag?: boolean;
    focus?: "center" | number | boolean;
    breakpoints?: Record<number, SplideOptions>;
  }

  interface SplideProps {
    options?: SplideOptions;
    children?: React.ReactNode; // 新增這行來支援 children 屬性
    [key: string]: unknown;
  }

  export const Splide: ComponentType<SplideProps>;
  export const SplideSlide: ComponentType;
}
