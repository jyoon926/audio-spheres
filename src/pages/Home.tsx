import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { MdAdd } from "react-icons/md";
import { GoGlobe } from "react-icons/go";
import Arcs from "../components/Arcs";

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
        <div className="absolute inset-0 flex flex-col justify-center items-center gap-10 p-5">
          <h1 className="max-w-[700px] text-center text-4xl sm:text-5xl md:text-6xl">
            Discover music and explore your taste like never before.
          </h1>
          <button className="button text-lg" onClick={login}>
            Start exploring
          </button>
          <Arcs />
        </div>
      )}
    </div>
  );
}
