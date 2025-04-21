import { timeFormats } from "@/config";
import { appData } from "@/utils/app-data";
import { getMediaUrl } from "@/utils/media";
import { Media } from "@bhalovashi/types/media";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MediumPage({ medium }: { medium: Media }) {
  const [mounted, setMounted] = useState(false);

  const topBarHeight = 18;
  const bottomBarHeight = 24;

  useEffect(() => {
    setMounted(true);
  }, []);

  const mainMedia = medium.media.formats.medium!;

  return (
    <div className="w-screen h-[calc(var(--vh,1vh)*100)] bg-black flex flex-col">
      <div
        className={`w-screen px-2 h-${topBarHeight} bg-black grid grid-cols-6 items-center`}
      >
        <div className="flex justify-start">
          <Link href={`/project/${medium.project.id}`}>
            <button className="flex items-center justify-center bg-gray-800 h-8 w-8 rounded-full">
              <Image src="/icons/back.svg" width={10} height={12} alt="Back" />
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
          height: `calc(100% - (${topBarHeight}rem + ${bottomBarHeight}rem) * 0.25)`,
        }}
        className="w-screen flex justify-center items-center"
      >
        <Image
          src={getMediaUrl(mainMedia.url)}
          alt="Loading"
          height={mainMedia.height}
          width={mainMedia.width}
        />
      </div>

      <div
        className={`h-${bottomBarHeight} w-screen bg-black grid grid-cols-6 items-center px-2`}
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

      <div
        className={`w-screen h-[calc(var(--vh,1vh)*100)] absolute top-0 left-0 ${mounted ? "transparent" : "bg-black"} transition duration-300 pointer-events-none`}
      ></div>
    </div>
  );
}

export async function getStaticProps({
  params,
}: {
  params: { projectId: string; mediumId: string };
}) {
  const media = appData.data.media;
  const medium = media.find((p) => p.id === Number(params.mediumId));

  return {
    props: {
      medium,
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
