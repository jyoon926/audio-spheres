import TrackTreeNode from "./TrackTreeNode";
import SpotifyWebApi from "spotify-web-api-js";
import { useTrackTree } from "../utils/TrackTreeContext";
import { useRef, Fragment } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Tooltip } from "react-tooltip";

interface Props {
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs;
}

export default function TrackTree({ spotifyApi }: Props) {
  const { rootNode } = useTrackTree();
  const divRef = useRef<HTMLDivElement | null>(null);

  if (!rootNode) return null;

  return (
    <div className="flex grow justify-center items-center overflow-hidden z-0">
      <TransformWrapper initialScale={1} minScale={0.25} maxScale={2} centerOnInit={true}>
        {({ centerView }) => (
          <Fragment>
            <TransformComponent>
              <div className="w-[19000px] h-[19000px] flex justify-center items-center">
                <div
                  className="absolute pointer-events-none"
                  style={{
                    width: "20000px",
                    height: "20000px",
                    backgroundImage: `radial-gradient(circle, rgba(var(--gray), 0.6) 1.5px, transparent 2px)`,
                    backgroundSize: "30px 30px",
                  }}
                />
                <div ref={divRef}>
                  <TrackTreeNode spotifyApi={spotifyApi} node={rootNode} />
                </div>
                <Tooltip id="tree-tooltip" style={{ zIndex: 10, backgroundColor: 'rgb(var(--gray))', padding: '0.5rem 0.75rem' }} opacity={1} />
              </div>
            </TransformComponent>
            <div className="fixed bottom-[5.4rem] md:bottom-2 left-1/2 -translate-x-1/2">
              <button
                onClick={() => centerView(1)}
                className="button light transition-all duration-200 ease-in-out"
                style={{ background: "rgba(var(--gray), 0.6)" }}
              >
                Reset view
              </button>
            </div>
          </Fragment>
        )}
      </TransformWrapper>
    </div>
  );
}
