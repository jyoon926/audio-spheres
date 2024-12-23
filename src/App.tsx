import "./App.scss";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header";
import Callback from "./pages/Callback";
import About from "./pages/About";
import Sphere from "./pages/Sphere";
import { useAuth } from "./utils/AuthContext";
import ProtectedRoute from "./utils/ProtectedRoute";
import Spheres from "./pages/Spheres";
import Create from "./pages/Create";
import Help from "./pages/Help";
import Playlists from "./pages/Playlists";
import PlaylistCreator from "./pages/PlaylistCreator";
import { Tooltip } from "react-tooltip";

function App() {
  const { loading } = useAuth();

  if (loading) return <div></div>;
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<ProtectedRoute />}>
          <Route path="" element={<Create />} />
        </Route>
        <Route path="/sphere/:id" element={<ProtectedRoute />}>
          <Route path="" element={<Sphere />} />
        </Route>
        <Route path="/spheres" element={<ProtectedRoute />}>
          <Route path="" element={<Spheres />} />
        </Route>
        <Route path="/playlist-creator" element={<ProtectedRoute />}>
          <Route path="" element={<PlaylistCreator />} />
        </Route>
        <Route path="/playlists" element={<ProtectedRoute />}>
          <Route path="" element={<Playlists />} />
        </Route>
        <Route path="/help" element={<Help />} />
        <Route path="/about" element={<About />} />
        <Route path="/callback" element={<Callback />} />
      </Routes>
      <Tooltip id="app-tooltip" style={{ zIndex: 10, backgroundColor: 'rgb(var(--gray))', padding: '0.5rem 0.75rem' }} opacity={1} />
    </>
  );
}

export default App;
