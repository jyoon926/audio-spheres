export default function About() {
  return (
    <div className="p-10 flex flex-col gap-10 justify-center items-center absolute inset-0">
      <div className="text-5xl max-w-[800px]">About</div>
      <p className="leading-normal text-center max-w-[700px] text-pretty">
        This project began as a creative experiment with the Spotify Web API, driven by a desire to reimagine music discovery. The result is a tree interface that transforms your listening experience into an interactive journey. Each "sphere" starts with a seed track—your favorite song, a recent find, or a representation of a specific vibe you're looking for. From there, branches grow into increasingly specific representations of your music taste.
      </p>
    </div>
  );
}
