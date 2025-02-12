import React from "react";

const WaterDrop = () => {
  return (
    <div className="relative w-6 h-[400px] overflow-hidden">
      {/* Water Drop animation */}
      <div className="absolute w-6 h-6 bg-blue-500 rounded-full animate-drop overflow-hidden"></div>
    </div>
  );
};

export default WaterDrop;
