const isDev = process.env.NEXT_PUBLIC_ENV === "development";
const url = typeof window !== "undefined" && window.location.href;
const domain = isDev && url && url.split("http://")[1].split(":")[0];
const isDomainOnMobile = domain && /192\.168\..+/.test(domain);
const backendHostFromMobile =
  isDomainOnMobile &&
  url
    .split(":")
    .map((_, idx) =>
      idx !== 2
        ? _
        : _.split("/")
            .map((__, idx) =>
              idx === 0 ? process.env.NEXT_PUBLIC_API_PORT : __
            )
            .join("/")
    )
    .join(":");

export const config = {
  backendHost:
    isDev && isDomainOnMobile
      ? backendHostFromMobile
      : process.env.NEXT_PUBLIC_API_BASE_URL,
};
