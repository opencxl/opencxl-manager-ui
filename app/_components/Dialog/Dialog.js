import React from "react";
import ReactDOM from "react-dom";

const Dialog = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="flex flex-col gap-8 justify-between bg-white rounded-lg p-8 w-[403px] h-[226px]">
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Dialog;
