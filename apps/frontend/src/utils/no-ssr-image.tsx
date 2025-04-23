import dynamic from "next/dynamic";

export const NoSSRImage = dynamic(() => import("next/image"), { ssr: false });
