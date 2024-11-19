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
          {socketEventData.eventName === "binding" ? "Bind" : "Unbind"} the
          device?
        </h1>
        {socketEventData.eventName === "binding" ? (
          <p className="text-sm">
            'vPPB {socketEventData.vppbId}' and&nbsp;
            {socketEventData.ldId !== undefined
              ? `'PPB ${socketEventData.physicalPortId}, LD ${socketEventData.ldId}'`
              : `'PPB ${socketEventData.physicalPortId}'`}
            &nbsp;will be connected.
            <br />
            Would you like to proceed with the connection?
          </p>
        ) : (
          <p className="text-sm">
            'vPPB {socketEventData.vppbId}' will be disconnected.
            <br />
            Would you like to proceed with the disconnection?
          </p>
        )}

        <div className="flex justify-end">
          <button
            onClick={closeDialog}
            className=" h-[48px] px-6 py-3 hover:bg-gray4"
          >
            Cancel
          </button>
          <button
            onClick={handleSocketEvent}
            className={"h-[48px] rounded px-6 py-3 text-white bg-black"}
          >
            {socketEventData.eventName === "binding" ? "Bind" : "Unbind"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Dialog;
