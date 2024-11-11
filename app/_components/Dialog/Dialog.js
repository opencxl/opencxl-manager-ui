import React from "react";
import ReactDOM from "react-dom";

const Dialog = ({
  isOpen,
  socketEventData,
  closeDialog,
  handleSocketEvent,
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="flex flex-col gap-8 justify-between bg-white rounded-lg p-8 w-[403px]">
        <h1 className="text-xl font-semibold">
          {socketEventData.physicalPortId ? "Binding" : "Unbinding"} to the
          device?
        </h1>
        <p className="text-sm">
          'vPPB {socketEventData.vppbId}' and 'PPB{" "}
          {socketEventData.physicalPortId}' will be&nbsp;
          {socketEventData.physicalPortId ? "connected" : "disconnected"}.
          <br />
          Would you like to proceed with the&nbsp;
          {socketEventData.physicalPortId ? "connection" : "disconnection"}?
        </p>
        <div className="flex justify-end">
          <button
            onClick={closeDialog}
            className="w-[102px] h-[48px] px-6 py-3 hover:bg-gray4"
          >
            Cancel
          </button>
          <button
            onClick={handleSocketEvent}
            className={
              "w-[102px] h-[48px] rounded px-6 py-3 text-white bg-black"
            }
          >
            {socketEventData.physicalPortId ? "Binding" : "Unbinding"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Dialog;
