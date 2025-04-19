import { appInitContext } from "@/init";
import { Project } from "@bhalovashi/types/project";

export default function ProjectPage(props: { project: Project }) {
  const { project } = props;

  return <div>Project Page: {project.name}</div>;
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
