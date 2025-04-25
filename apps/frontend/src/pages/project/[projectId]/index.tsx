import IPhoneCameraModeCarousel, {
  Item,
} from "@/components/IPhoneCameraModeCarousel";
import {
  PHOTO_DRAG_PAGE,
  PhotoDragTransitionContext,
} from "@/contexts/PhotoDragTransitionContext";
import { appData, useAppData } from "@/utils/app-data";
import { getLargestMediaFormat, getMediaUrl } from "@/utils/media";
import { Project } from "@bhalovashi/types/project";
import _ from "lodash";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

export default function ProjectPage(props: { project: Project }) {
  const { project } = props;
  const router = useRouter();
  const { projects, media, thumbnailDataURLs } = useAppData();
  const { initMediaTransition, setHasTargetPageLoaded } = useContext(
    PhotoDragTransitionContext
  );

  const projectIndex = useMemo(
    () => projects.indexOf(projects.find((p) => p.id === project.id)!),
    []
  );

  const carouselItems = useMemo<Item[]>(
    () => projects.map((p) => ({ id: p.id + "", label: p.name })),
    []
  );
  const setSelectedProject = useCallback((project: Item) => {
    router.replace(`/project/${project.id}`);
  }, []);

  const topBarHeight = 20;
  const bottomBarHeight = 40;

  const projectThumbnail = useMemo(
    () => ({
      ...media.find((m) => m.id === project.thumbnail_media.id)!,
      dataURL: thumbnailDataURLs[project.thumbnail_media.id + ""],
    }),
    [project]
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setHasTargetPageLoaded!(PHOTO_DRAG_PAGE.PROJECT);
  }, []);

  return (
    <>
      <Head>
        <title>Bhalovashi - {project.name}</title>
      </Head>
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
          className="relative bg-gray-400 flex items-center justify-center"
        >
          <div className="text-5xl font-bold text-gray-500 text-center px-6 uppercase">
            Something interesting will happen here :)
          </div>
          <div className="w-[1px] h-full absolute left-1/3 bg-gray-500" />
          <div className="w-[1px] h-full absolute left-2/3 bg-gray-500" />
          <div className="w-full h-[1px] absolute top-1/3  bg-gray-500" />
          <div className="w-full h-[1px] absolute top-2/3  bg-gray-500" />
        </div>

        <div
          className={`h-${bottomBarHeight} bg-black w-full flex items-center justify-center`}
        >
          <div className="flex flex-col h-full justify-start pt-1 items-center w-full max-w-[600px] overflow-hidden">
            <IPhoneCameraModeCarousel
              items={carouselItems}
              onSelect={setSelectedProject}
              initialIndex={projectIndex}
              overlayClassName="w-full mx-auto"
            />

            <div className="w-full grid grid-cols-3 gap-x-2 mt-4 px-3 items-center">
              <div>
                <Image
                  className="w-14 h-14 bg-gray-400 rounded-lg cursor-pointer"
                  src={projectThumbnail.dataURL}
                  alt="Project Thumbnail"
                  width={48}
                  height={48}
                  onClick={() =>
                    initMediaTransition!(
                      {
                        id: projectThumbnail.id,
                        projectId: project.id,
                        url: projectThumbnail.dataURL,
                        mediaDims: _.pick(
                          projectThumbnail.media.formats.thumbnail,
                          ["height", "width"]
                        ),
                      },
                      1
                    )
                  }
                />
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
    </>
  );
}

export async function getStaticProps({
  params,
}: {
  params: { projectId: string };
}) {
  const projects = appData.data.projects;
  const project = projects.find((p) => p.id === Number(params.projectId));

  return {
    props: {
      project,
    },
  };
}

export async function getStaticPaths() {
  const projects = appData.data.projects;
  const pathsConfig = {
    paths: projects.map((p) => ({ params: { projectId: p.id + "" } })),
    fallback: "blocking",
  };
  return pathsConfig;
}
