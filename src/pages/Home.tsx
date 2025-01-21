import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { MdAdd } from "react-icons/md";
import { GoGlobe } from "react-icons/go";

export default function Home() {
  const { login, isAuthenticated } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <div className="absolute inset-0 w-full p-6 sm:pl-20 flex justify-center items-center">
          <div className="flex flex-col justify-start items-center gap-10 text-center">
            <div className="text-4xl">Welcome to Audio Spheres!</div>
            <div className="flex flex-row flex-wrap justify-center gap-3 text-lg">
              <Link to="/create" className="button leading-snug flex justify-center items-center gap-2 px-4"><MdAdd className="text-2xl" /> Create a new Sphere</Link>
              <Link to="/spheres" className="button light leading-snug flex justify-center items-center gap-2 px-4"><GoGlobe className="text-2xl" /> Manage your existing Spheres</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col justify-start items-center p-5 md:px-20">
          <div className="w-full max-w-[1600px] flex flex-col justify-start items-start gap-10 pt-[20vh] pb-20">
            <h1 className="max-w-[14em] text-6xl sm:7xl sm:text-[5rem]">
              Discover music and explore your taste like never before.
            </h1>
            <p className="max-w-[32em] text-2xl">Explore your music taste with a unique tree interface. Start with a favorite track and watch as branches unfold, leading you on a personalized journey of discovery.</p>
            <button className="button text-xl px-6 py-3" onClick={login}>
              Start exploring
            </button>
            <div className="w-full mt-10 bg-light backdrop-blur-xl p-2 rounded-lg aspect-video">
              <video className="w-full rounded" src="/videos/demo.mp4" preload="auto" autoPlay loop playsInline muted />
              <div className="absolute w-full rounded aspect-video flex flex-col gap-4 justify-center items-center">
                <p className="text-xl opacity-50">Loading video</p>
                <div className="spinner lg"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
