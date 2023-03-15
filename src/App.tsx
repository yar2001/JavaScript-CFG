import { IoBook, IoBuild, IoInformation } from 'react-icons/io5';
import { Route, RouterProvider, Routes } from 'react-router';
import { createHashRouter, NavLink } from 'react-router-dom';
import { AboutPage } from './pages/about';
import { DocPage } from './pages/doc';
import { HomePage } from './pages/home';

const router = createHashRouter([
  {
    path: '*',
    element: <Main />,
    errorElement: <>404</>,
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}

function Main() {
  return (
    <>
      <div className="flex flex-col overflow-hidden lg:min-h-screen lg:flex-row">
        <div className="flex gap-2 px-2 py-2 bg-neutral-100 shrink-0 lg:flex-col">
          <NavLink
            to="/"
            className={({ isActive }) =>
              'p-2 transition-colors rounded-md ' +
              (isActive ? 'text-blue-500 hover:text-blue-500' : 'text-gray-400 hover:text-gray-400')
            }
          >
            <IoBuild className="w-6 h-6" />
          </NavLink>
          <NavLink
            to="/doc"
            className={({ isActive }) =>
              'p-2 transition-colors rounded-md ' +
              (isActive ? 'text-blue-500 hover:text-blue-500' : 'text-gray-400 hover:text-gray-400')
            }
          >
            <IoBook className="w-6 h-6" />
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              'p-2 transition-colors rounded-md ' +
              (isActive ? 'text-blue-500 hover:text-blue-500' : 'text-gray-400 hover:text-gray-400')
            }
          >
            <IoInformation className="w-6 h-6" />
          </NavLink>
        </div>

        <Routes>
          <Route path="doc/*" element={<DocPage />} />
          <Route path="about/*" element={<AboutPage />} />
          <Route path="/*" element={<HomePage />} />
        </Routes>
      </div>
    </>
  );
}
