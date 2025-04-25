const isDev = process.env.NEXT_PUBLIC_ENV === "development";
const url = typeof window !== "undefined" && window.location.href;
const mobileDomain = isDev && url && url.split("http://")[1]?.split(":")[0];
const isDomainOnMobile = mobileDomain && /192\.168\..+/.test(mobileDomain);
const backendHostFromMobile = isDomainOnMobile
  ? url
      .split(":")
      .map((_, idx) => (idx !== 2 ? _ : process.env.NEXT_PUBLIC_API_PORT))
      .join(":")
  : undefined;

export const config = {
  backendHost:
    isDev && isDomainOnMobile
      ? backendHostFromMobile
      : process.env.NEXT_PUBLIC_API_BASE_URL,
};

export const timeFormats = {
  shortDate: "D MMM Y, HH:mm a",
};

export const galleryTopBarHeight = 18;
export const galleryBottomBarHeight = 28;
