export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  return <div>ProjectPage</div>;
}

export async function getStaticProps({
  params,
}: {
  params: { projectId: string };
}) {
  return {
    props: {
      project,
    },
  };
}

export async function getStaticPaths() {
  return {
    paths: [1, 2, 3],
    fallback: "blocking",
  };
}
