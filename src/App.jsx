import { Children, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Drawer from "./Drawer/drawer";
import Prompt from "./components/prompt/prompt";
import Login from "./Auth/login/login";
import Register from "./Auth/Register/register";

function App() {
  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("x-access-token");
    return token ? children : <Navigate to="/" />;
  };

  const publicRoute = [
    {
      path: "/",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
  ];

  const protectedRoute = [
    {
      path: "/drawer",
      element: <Drawer />,
    },
    {
      path: "/prompt",
      element: <Prompt />,
    },
  ];

  return (
    <>
      <>
        <Router>
          <Routes>
            {
              // publicRoute

              publicRoute?.map((item, i) => {
                return (
                  <Route key={i} path={item.path} element={item?.element} />
                );
              })
            }

            {/* protected Route */}

            {protectedRoute?.map((item, i) => {
              return (
                <>
                  <Route
                    key={i}
                    path={item?.path}
                    element={<PrivateRoute>{item?.element}</PrivateRoute>}
                  />
                </>
              );
            })}

            {/* <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/drawer" element={<Drawer />} />
            <Route path="/prompt" element={<Prompt />} /> */}
          </Routes>
        </Router>
      </>
    </>
  );
}

export default App;
