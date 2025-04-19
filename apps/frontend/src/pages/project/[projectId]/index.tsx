import IPhoneCameraTextCarousel from "@/components/IPhoneCameraTextCarousel";
import { appInitContext } from "@/init";
import { Project } from "@bhalovashi/types/project";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ProjectPage(props: { project: Project }) {
  const { project } = props;

  const [selectedMode, setSelectedMode] = useState(0);
  const cameraModes = ["Photo", "Video", "Portrait", "Pano"];

  const topBarHeight = 20;
  const bottomBarHeight = 40;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-screen h-[calc(var(--vh,1vh)*100)] flex flex-col">
      <div className={`h-${topBarHeight} bg-black`}>
        <div className="grid grid-cols-3 px-5 h-full max-w-[600px] mx-auto">
          <div className="flex gap-x-3 justify-start mb-2">
            <Image
              src="/icons/lightning-icon.svg"
              alt="lightning"
              width={30}
              height={30}
            />
            <Image
              src="/icons/people-icon.svg"
              alt="lightning"
              width={30}
              height={30}
            />
          </div>
          <div className="flex gap-x-2 mb-2"></div>
          <div className="flex gap-x-2 justify-end mb-2">
            <Image
              src="/icons/depth.svg"
              alt="lightning"
              width={30}
              height={30}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          height: `calc(100% - (0.25 * (${topBarHeight}rem + ${bottomBarHeight}rem))`,
        }}
        className="bg-gray-400"
      ></div>

      <div className={`h-${bottomBarHeight} bg-black`}>
        <div className="flex flex-col items-center">
          <IPhoneCameraTextCarousel
            items={cameraModes}
            onSelect={setSelectedMode}
            initialIndex={0}
            overlayClassName="w-full max-w-[600px] mx-auto"
          />

          <div className="w-full grid grid-cols-3 gap-x-2 mt-4 px-3 items-center max-w-[600px]">
            <div>
              <div className="w-14 h-14 bg-gray-400 rounded-lg"></div>
            </div>
            <div className="flex justify-center">
              <Image
                src="/icons/capture.svg"
                alt="flash"
                width={70}
                height={70}
              />
            </div>
            <div className="flex justify-end">
              <Image
                src="/icons/front-cam.svg"
                alt="flash"
                width={50}
                height={50}
              />
            </div>
          </div>
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
  params: { projectId: string };
}) {
  const projects = await appInitContext.getProjects();
  const project = projects.find((p) => p.id === Number(params.projectId));

  return {
    props: {
      project,
    },
  };
}

export async function getStaticPaths() {
  const projects = await appInitContext.getProjects();
  const pathsConfig = {
    paths: projects.map((p) => ({ params: { projectId: p.id + "" } })),
    fallback: "blocking",
  };
  return pathsConfig;
}
