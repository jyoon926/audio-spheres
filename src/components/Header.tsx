import { useAuth } from "../utils/AuthContext";
import { Link } from "react-router-dom";
import { MdAdd, MdInfoOutline } from "react-icons/md";
import { GoGlobe } from "react-icons/go";
import { useState } from "react";
import { PiCirclesFour } from "react-icons/pi";

export default function Header() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const handleLogout = () => {
    setShowMenu(false);
    logout();
  }

  return (
    <>
      {/* Mobile menu */}
      <div className={`fixed inset-0 z-30 bg-glass backdrop-blur-xl duration-300 p-3 pt-20 ${showMenu ? "" : "opacity-0 pointer-events-none"} sm:hidden`}>
        <div className="w-full h-full flex flex-col items-start justify-between">
          <div className="w-full">
            <div className="flex flex-col gap-1">
              <Link to="/create" className="flex flex-row gap-4 leading-[0] items-center p-2" onClick={() => setShowMenu(false)}>
                <MdAdd className="text-2xl" /> Create a new Sphere
              </Link>
              <Link to="/spheres" className="flex flex-row gap-4 leading-[0] items-center p-2" onClick={() => setShowMenu(false)}>
                <GoGlobe className="text-2xl" /> Your Spheres
              </Link>
            </div>
            <div className="w-full py-2">
              <div className="border-t"></div>
            </div>
            <div className="flex flex-col gap-1">
              <Link
                className="flex flex-row gap-4 leading-[0] items-center p-2"
                to="/about" onClick={() => setShowMenu(false)}
              >
                <MdInfoOutline className="text-2xl" /> About
              </Link>
            </div>
          </div>
          <div>
            <div className="flex flex-col gap-1">
              <button className="flex flex-row gap-4 leading-[0] items-center p-2" onClick={handleLogout}>
                <a href={user?.external_urls.spotify} target="_blank">
                  <img className="h-6 w-6 rounded-full" src={user?.images![0].url} alt="" />
                </a> Log out
              </button>
            </div>
          </div>
        </div>
      </div>

      {isAuthenticated ? (
        <div className="fixed top-0 right-0 w-full h-full flex flex-col justify-start items-start p-2 z-40 gap-2 pointer-events-none">
          {/* Mobile header */}
          <div className="sm:hidden w-full flex flex-row justify-between items-center px-4 py-3 bg-glass backdrop-blur-xl rounded-lg pointer-events-auto">
            <div className="flex flex-row gap-5 items-center">
              <Link className="flex flex-row items-center gap-3 text-lg" to="/">
                <GoGlobe className="text-2xl" />
                Audio Spheres
              </Link>
            </div>
            <button className="py-1 flex flex-col gap-1" onClick={() => setShowMenu(prev => !prev)}>
              <div className="w-7 border-t border-foreground"></div>
              <div className="w-7 border-t border-foreground"></div>
              <div className="w-7 border-t border-foreground"></div>
            </button>
          </div>

          {/* Desktop side menu */}
          <div className="h-full p-2 bg-glass backdrop-blur-xl rounded-lg pointer-events-auto hidden sm:flex">
            <div className="h-full flex flex-col items-start justify-between duration-300 w-10 hover:w-72 overflow-hidden">
              <div>
                <div className="flex flex-col gap-1">
                  <Link to="/" className="w-72 flex flex-row gap-4 leading-[0] items-center duration-300 hover:bg-lighter rounded-full p-2 text-lg font-bold">
                    <GoGlobe className="text-2xl" /> Audio Spheres
                  </Link>
                </div>
                <div className="w-full py-2">
                  <div className="border-t"></div>
                </div>
                <div className="flex flex-col gap-1">
                  <Link to="/create" className="w-72 flex flex-row gap-4 leading-[0] items-center duration-300 hover:bg-lighter rounded-full p-2">
                    <MdAdd className="text-2xl" /> Create a new Sphere
                  </Link>
                  <Link to="/spheres" className="w-72 flex flex-row gap-4 leading-[0] items-center duration-300 hover:bg-lighter rounded-full p-2">
                    <PiCirclesFour className="text-2xl" /> Your Spheres
                  </Link>
                </div>
                <div className="w-full py-2">
                  <div className="border-t"></div>
                </div>
                <div className="flex flex-col gap-1">
                  <Link
                    className="w-72 flex flex-row gap-4 leading-[0] items-center duration-300 hover:bg-lighter rounded-full p-2"
                    to="/about"
                  >
                    <MdInfoOutline className="text-2xl" /> About
                  </Link>
                </div>
              </div>
              <div>
                <div className="flex flex-col gap-1">
                  <button className="w-72 flex flex-row gap-4 leading-[0] items-center duration-300 hover:bg-lighter rounded-full p-2" onClick={logout}>
                    <a href={user?.external_urls.spotify} target="_blank">
                      <img className="h-6 w-6 rounded-full" src={user?.images![0].url} alt="" />
                    </a> Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Unauthenticated header
        <div className="fixed top-0 right-0 w-full flex flex-col justify-center items-center p-2 z-40 gap-3">
          <div className="flex flex-row justify-between items-center w-full sm:w-[400px] py-3 px-4 bg-glass rounded-lg">
            <Link className="flex flex-row items-center gap-3 text-lg" to="/">
              <GoGlobe className="text-2xl" />
              Audio Spheres
            </Link>
            <div className="flex flex-row gap-7 mr-2">
              <Link className="link" to="/about">
                About
              </Link>
              <button className="link" onClick={login}>
                Log in
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
