import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Drawer from "./Drawer/drawer";
import Prompt from "./components/prompt/prompt";

function App() {
  return (
    <>
      <>
        <Router>
          <Routes>
            <Route path="/drawer" element={<Drawer />} />
             <Route path="/prompt" element={<Prompt />} />
          </Routes>
        </Router>
      </>
    </>
  );
}

export default App;
