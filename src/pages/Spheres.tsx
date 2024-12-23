import { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthContext";
import { deleteSphere, fetchSpheres, fetchSpheresCount } from "../utils/FirestoreService";
import { Link } from "react-router-dom";
import { Sphere, Track, TreeNode } from "../utils/Types";
import { formatDistanceToNow } from "date-fns";
import ThreeDotMenu from "../components/ThreeDotMenu";
import { MdAdd } from "react-icons/md";

export default function Spheres() {
  const { user } = useAuth();
  const [spheres, setSpheres] = useState<Sphere[]>([]);
  const [spheresCount, setSpheresCount] = useState<number>();

  const loadSpheres = async () => {
    const countResponse = await fetchSpheresCount(user!.id);
    if (countResponse) {
      setSpheresCount(countResponse);
    } else {
      setSpheresCount(0);
    }
    const spheresResponse = await fetchSpheres(user!.id);
    if (spheresResponse) setSpheres(spheresResponse as Sphere[]);
  };

  const getTrackListFromNode = (node: TreeNode<Track>) => {
    const tracks: Track[] = [];
    let queue = [node];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr.selected) {
        tracks.push(curr.value);
      }
      queue.push(...curr.children);
    }
    return tracks;
  };

  const handleDelete = async (event: any, sphere: Sphere) => {
    event.preventDefault();
    await deleteSphere(user!.id, sphere);
    setSpheres(spheres.filter((s) => s.id !== sphere.id));
  }

  useEffect(() => {
    loadSpheres();
  }, []);

  return (
    <div className="w-full p-6 sm:p-3 sm:pl-20">
      <div className="w-full pt-24 sm:p-12 flex flex-col gap-6">
        <div className="text-4xl">Your Spheres</div>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(24rem, 1fr))" }}>
          {spheresCount === undefined ? (
            <div className="h-[166px] bg-glass rounded-lg placeholder p-5 flex flex-col gap-4 backdrop-blur-xl">
              <div className="w-full h-6 bg-glass rounded" />
              <div className="w-full border-t" />
              <div className="w-full h-5 bg-glass rounded" />
              <div className="w-full h-5 bg-glass rounded" />
              <div className="flex flex-row items-center overflow-auto scrollbar-hidden gap-2">
                <div className="w-12 h-12 rounded bg-glass" />
                <div className="w-12 h-12 rounded bg-glass" />
                <div className="w-12 h-12 rounded bg-glass" />
                <div className="w-12 h-12 rounded bg-glass" />
                <div className="w-12 h-12 rounded bg-glass" />
              </div>
            </div>
          ) : spheresCount === 0 ? (
            <div className="flex flex-col items-start gap-5">
              <div className="italic opacity-60">You have no spheres.</div>
              <Link to="/create" className="button leading-snug flex justify-center items-center gap-2 px-4"><MdAdd className="text-2xl" /> Create a new Sphere</Link>
            </div>
          ) : spheres.length === 0 ? (
            [...Array(spheresCount)].map((_, index) => (
              <div className="h-[166px] bg-glass rounded-lg placeholder p-5 flex flex-col gap-4 backdrop-blur-xl" key={index}>
                <div className="w-full h-6 bg-glass rounded" />
                <div className="w-full border-t" />
                <div className="w-full h-5 bg-glass rounded" />
                <div className="w-full h-5 bg-glass rounded" />
                <div className="flex flex-row items-center overflow-auto scrollbar-hidden gap-2">
                  <div className="w-12 h-12 rounded bg-glass" />
                  <div className="w-12 h-12 rounded bg-glass" />
                  <div className="w-12 h-12 rounded bg-glass" />
                  <div className="w-12 h-12 rounded bg-glass" />
                  <div className="w-12 h-12 rounded bg-glass" />
                </div>
              </div>
            ))
          ) : (
            <>
              {spheres.map((sphere) => (
                <Link
                  className="bg-glass hover:bg-lighter duration-300 p-5 flex flex-col gap-4 rounded-lg backdrop-blur-xl"
                  to={`/sphere/${sphere.id}`}
                  key={sphere.id}
                >
                  <div className="text-xl leading-tight flex flex-row justify-between">
                    {sphere.title}
                    <ThreeDotMenu>
                      <button className="button light sm w-28" onClick={(e) => handleDelete(e, sphere)}>Delete</button>
                    </ThreeDotMenu>
                  </div>
                  <div className="w-full border-t" />
                  <div className="overflow-hidden whitespace-nowrap text-ellipsis leading-tight">
                    {sphere.description}
                  </div>
                  <div className="text-base opacity-60">
                    Updated {formatDistanceToNow(sphere.lastEditedAt.toDate())} ago
                  </div>
                  <div className="flex flex-row items-center overflow-auto scrollbar-hidden gap-2">
                    {getTrackListFromNode(sphere.rootNode).map((track) => (
                      <img className="w-16 h-16 rounded" src={track.album.image} alt="" key={track.id} />
                    ))}
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
