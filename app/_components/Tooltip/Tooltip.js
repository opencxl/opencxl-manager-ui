import ReactDOM from "react-dom";

const DeviceTooltip = ({ isOpen, node }) => {
  if (!isOpen) {
    return;
  }
  const tooltipContainer = document.querySelector(`[data-id="${node.id}"]`);

  return ReactDOM.createPortal(
    <div className="relative">
      <div className="fixed top-[78px] -right-[40px]">
        <div className="absolute  w-0 h-0 -top-9 left-1/2 transform -translate-x-1/2 border-[20px] border-solid border-t-transparent border-x-transparent border-b-black rounded-lg"></div>
        <div className="w-[196px] text-left p-6 z-4 rounded-lg text-white text-sm bg-black flex flex-col gap-6">
          <p className="font-bold">Single Logical Device</p>
          <p className="font-regular">
            Port ID <br /> {node.data.portId}
          </p>
        </div>
      </div>
      {/* Allcoated LDs를 LD로 바꿔야한다. */}
      {/* <div className="fixed top-0 -left-[220px]">
        <div className="absolute w-0 h-0 -right-9 top-1/2 transform -translate-y-1/2 border-[20px] border-solid border-r-transparent border-y-transparent border-l-black rounded-lg"></div>
        <div className="w-[196px] text-left p-6 z-4 rounded-lg text-white text-sm bg-black flex flex-col gap-6">
          <p className="font-bold">Multi Logical Device</p>
          <p className="font-regular">
            Port ID <br /> {node.data.portId}
          </p>
          <p className="font-regular">
            Allocated LDs <br /> {node.data.portId}
          </p>
        </div>
      </div> */}
    </div>,
    tooltipContainer
  );
};

export default DeviceTooltip;
