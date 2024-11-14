import ReactDOM from "react-dom";

const DeviceTooltip = ({ isOpen, node }) => {
  if (!isOpen) {
    return;
  }
  const tooltipContainer = document.querySelector(`[data-id="${node.id}"]`);
  return ReactDOM.createPortal(
    <div className="relative">
      {node.data.deviceType === "SLD" ? (
        <div className="fixed top-[78px] -right-[40px]">
          {/* 화면 크기에 따라 조정이 필요하다, 툴팁이 Device 아래로 출력되는데 화면이 작으면 툴팁이 안보인다. 위로 보여져야 한다. */}
          <div className="absolute  w-0 h-0 -top-9 left-1/2 transform -translate-x-1/2 border-[20px] border-solid border-t-transparent border-x-transparent border-b-black rounded-lg"></div>
          <div className="w-[196px] text-left p-6 z-4 rounded-lg text-white text-sm bg-black flex flex-col gap-6">
            <p className="font-bold">Single Logical Device</p>
            <p className="font-regular">
              Port ID <br /> {node.data.portId}
            </p>
          </div>
        </div>
      ) : (
        <div className="fixed top-[92px] -left-[220px]">
          <div className="absolute w-0 h-0 -right-9 top-1/2 transform -translate-y-1/2 border-[20px] border-solid border-r-transparent border-y-transparent border-l-black rounded-lg"></div>
          <div className="w-[196px] text-left p-6 z-4 rounded-lg text-white text-sm bg-black flex flex-col gap-6">
            <p className="font-bold">Multi Logical Device</p>
            <p className="font-regular">
              Port ID <br /> {node.data.portId}
            </p>
            <p className="font-regular">
              Allocated LDs <br /> {node.data.logicalDevices.length}
            </p>
          </div>
        </div>
      )}
    </div>,
    tooltipContainer
  );
};

export default DeviceTooltip;
