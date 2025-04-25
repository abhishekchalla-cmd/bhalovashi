import IOSSlider from "@/components/IOSSlider";
import {
  IOSSLIDER_ITEM_STATE,
  IOSSliderItem,
} from "@/components/IOSSlider/types";
import LargeImageSlider, {
  LARGE_IMAGE_SLIDER_ITEM_TYPE,
} from "@/components/LargeImageSlider";
import { galleryBottomBarHeight, galleryTopBarHeight } from "@/config";
import { appData, useAppData } from "@/utils/app-data";
import { getLargestMediaFormat, getMediaUrl } from "@/utils/media";
import { NoSSRImage } from "@/utils/no-ssr-image";
import { Media } from "@bhalovashi/types/media";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

export default function MediumPage({
  medium,
  index,
}: {
  medium: Media;
  index: number;
}) {
  const { media, thumbnailDataURLs } = useAppData();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const items = useMemo(() => {
    const result: IOSSliderItem<{
      thumbnail: {
        url: string;
        height: number;
        width: number;
      };
      projectId: number;
    }>[] = media.map((m) => ({
      id: m.id,
      data: {
        thumbnail: {
          url: m.media.formats.thumbnail.url,
          height: m.media.formats.thumbnail.height,
          width: m.media.formats.thumbnail.width,
        },
        projectId: m.project.id,
      },
    }));
    return result;
  }, []);

  return (
    <>
      <Head>
        <title>Bhalovashi's Works - {medium.title}</title>
      </Head>
      <div className="w-screen h-[calc(var(--vh,1vh)*100)] bg-black flex flex-col">
        <div
          className={`w-screen px-2 h-${galleryTopBarHeight} bg-black grid grid-cols-6 items-center`}
        >
          <div className="flex justify-start">
            <Link href={`/project/${medium.project.id}`}>
              <button className="flex items-center justify-center bg-gray-800 h-8 w-8 rounded-full">
                <Image
                  src="/icons/back.svg"
                  width={10}
                  height={12}
                  alt="Back"
                />
              </button>
            </Link>
          </div>
          <div className="flex flex-col justify-center items-center col-span-4">
            <span className="text-white font-semibold">{medium.title}</span>
            <span className="text-gray-500 text-sm">{medium.project.name}</span>
          </div>
          <div className="flex justify-end">
            <button className="flex items-center justify-center bg-gray-800 h-8 w-8 rounded-full">
              <Image
                src="/icons/options.svg"
                alt="Options"
                width={18}
                height={12}
              />
            </button>
          </div>
        </div>
        <div
          style={{
            height: `calc(100% - (${galleryTopBarHeight}rem + ${galleryBottomBarHeight}rem) * 0.25)`,
          }}
          className="w-screen flex justify-center items-center"
        >
          <LargeImageSlider
            previousItem={
              index > 0 ? getLargeImageSliderItem(media[index - 1]) : undefined
            }
            currentItem={getLargeImageSliderItem(medium)}
            nextItem={
              index < media.length - 1
                ? getLargeImageSliderItem(media[index + 1])
                : undefined
            }
            onChange={(item) =>
              router.push(`/project/${item.data.projectId}/${item.id}`)
            }
          />
        </div>

        <div
          className={`h-${galleryBottomBarHeight} flex flex-col w-full justify-between py-2`}
        >
          <IOSSlider
            style={{ height: "30px" }}
            items={items}
            renderItem={(item, state, isDragging) => {
              const { thumbnail } = item.data;
              const mediaUrl = getMediaUrl(thumbnail.url);
              const mediaWidth = thumbnail.width * (30 / thumbnail.height);
              return (
                <div
                  key={item.id}
                  style={{ transition: "0.2s" }}
                  className={`h-full w-3 bg-gray-500 overflow-hidden rounded ${state === IOSSLIDER_ITEM_STATE.SELECTED_AND_IN_CROSSHAIR && !isDragging ? `mx-2` : ""}`}
                >
                  <NoSSRImage
                    src={mediaUrl}
                    style={{
                      userSelect: "none",
                      height: "30px",
                      width: `${mediaWidth}px`,
                      maxWidth: "unset",
                    }}
                    alt={item.id + ""}
                    height={30}
                    width={mediaWidth}
                    blurDataURL={thumbnailDataURLs[item.id + ""]}
                  />
                </div>
              );
            }}
            defaultSelectedItemId={medium.id}
            onItemInCrosshair={(m) => {
              router.push(`/project/${m.data.projectId}/${m.id}`);
            }}
            onItemChange={(m) => {
              router.push(`/project/${m.data.projectId}/${m.id}`);
            }}
          />
          <div
            className={`w-screen bg-black grid grid-cols-6 items-center px-2`}
          >
            <div className="flex justify-start">
              <button className="flex items-center justify-center bg-gray-800 h-11 w-11 rounded-full">
                <Image
                  src="/icons/share.svg"
                  alt="Options"
                  width={19}
                  height={15}
                />
              </button>
            </div>

            <div className="col-span-4 flex justify-center">
              <div className="flex items-center justify-center bg-gray-800 h-11 rounded-full px-3 gap-x-3">
                <button className="flex items-center justify-center bg-gray-800 h-11 w-11 rounded-full">
                  <Image
                    src="/icons/heart.svg"
                    alt="Options"
                    width={23}
                    height={15}
                  />
                </button>
                <button className="flex items-center justify-center bg-gray-800 h-11 w-11 rounded-full">
                  <Image
                    src="/icons/info.svg"
                    alt="Options"
                    width={23}
                    height={15}
                  />
                </button>
                <button className="flex items-center justify-center bg-gray-800 h-11 w-11 rounded-full">
                  <Image
                    src="/icons/edit.svg"
                    alt="Options"
                    width={23}
                    height={15}
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="flex items-center justify-center bg-gray-800 h-11 w-11 rounded-full">
                <Image
                  src="/icons/delete.svg"
                  alt="Options"
                  width={22}
                  height={15}
                />
              </button>
            </div>
          </div>
        </div>

        <div
          className={`w-screen h-[calc(var(--vh,1vh)*100)] absolute top-0 left-0 ${mounted ? "transparent" : "bg-black"} transition duration-300 pointer-events-none`}
        ></div>
      </div>
    </>
  );
}

const getLargeImageSliderItem = (medium: Media) => {
  const largestMediaFormat = getLargestMediaFormat(medium.media);
  return {
    type: LARGE_IMAGE_SLIDER_ITEM_TYPE.IMAGE,
    id: medium.id,
    file: {
      src: getMediaUrl(largestMediaFormat.url),
      height: largestMediaFormat.height,
      width: largestMediaFormat.width,
    },
    data: {
      projectId: medium.project.id,
    },
  };
};

export async function getStaticProps({
  params,
}: {
  params: { projectId: string; mediumId: string };
}) {
  const media = appData.data.media;
  const medium = media.find((p) => p.id === Number(params.mediumId))!;
  const index = media.indexOf(medium);

  return {
    props: {
      medium,
      index,
    },
  };
}

export async function getStaticPaths() {
  const media = appData.data.media;
  const pathsConfig = {
    paths: media.map((p) => ({
      params: { mediumId: p.id + "", projectId: p.project.id + "" },
    })),
    fallback: "blocking",
  };
  return pathsConfig;
}
