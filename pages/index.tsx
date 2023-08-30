import React from "react";
import dynamic from "next/dynamic";
const RentContent = dynamic(() => import("../components/RentContent"), {
  ssr: false,
});

function App() {
  return (
    <>
      <RentContent />
    </>
  );
}

export default App;
