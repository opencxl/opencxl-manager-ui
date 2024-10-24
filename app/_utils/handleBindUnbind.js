import { useSocket } from "@/app/_components/providers/socket-provider";

export const handleBindUnbind = (
  vcsId,
  vppb,
  open,
  setOpen,
  handleClose,
  showError,
  handleRefresh
) => {
  const { socket } = useSocket();

  const handleBind = () => {
    if (open.dsp == null) return;
    console.log(`Bind vPPB ${vppb} from VCS ${vcsId} to DSP ${open.dsp}`);
    setOpen({
      ...open,
      error: null,
      loading: true,
    });
    socket.emit(
      "vcs:bind",
      {
        virtualCxlSwitchId: vcsId,
        vppbId: vppb,
        physicalPortId: Number(open.dsp),
      },
      (args) => {
        if (args.error) {
          setOpen({
            ...open,
            loading: false,
          });
          showError(args.error, vppb);
          return;
        }
        handleClose();
        handleRefresh();
      }
    );
  };

  const handleUnbind = () => {
    console.log(`Unbind vPPB ${vppb} from VCS ${vcsId}`);
    setOpen({
      ...open,
      error: null,
      loading: true,
    });
    socket.emit(
      "vcs:unbind",
      {
        virtualCxlSwitchId: vcsId,
        vppbId: Number(vppb),
      },
      (args) => {
        if (args.error) {
          setOpen({
            ...open,
            loading: false,
          });
          showError(args.error, vppb);
          return;
        }
        handleClose();
        handleRefresh();
      }
    );
  };

  return {
    handleBind,
    handleUnbind,
  };
};

// export const handleBind = (
//   vcsId,
//   vppb,
//   open,
//   setOpen,
//   handleClose,
//   showError,
//   handleRefresh,
//   socket
// ) => {
//   if (open.dsp == null) return;
//   console.log(`Bind vPPB ${vppb} from VCS ${vcsId} to DSP ${open.dsp}`);
//   setOpen({
//     ...open,
//     error: null,
//     loading: true,
//   });
//   socket.emit(
//     "vcs:bind",
//     {
//       virtualCxlSwitchId: vcsId,
//       vppbId: vppb,
//       physicalPortId: Number(open.dsp),
//     },
//     (args) => {
//       if (args.error) {
//         setOpen({
//           ...open,
//           loading: false,
//         });
//         showError(args.error, vppb);
//         return;
//       }
//       handleClose();
//       handleRefresh();
//     }
//   );
// };

// export const handleUnbind = (
//   vcsId,
//   vppb,
//   open,
//   setOpen,
//   handleClose,
//   showError,
//   handleRefresh,
//   socket
// ) => {
//   console.log(`Unbind vPPB ${vppb} from VCS ${vcsId}`);
//   setOpen({
//     ...open,
//     error: null,
//     loading: true,
//   });
//   socket.emit(
//     "vcs:unbind",
//     {
//       virtualCxlSwitchId: vcsId,
//       vppbId: Number(vppb),
//     },
//     (args) => {
//       if (args.error) {
//         setOpen({
//           ...open,
//           loading: false,
//         });
//         showError(args.error, vppb);
//         return;
//       }
//       handleClose();
//       handleRefresh();
//     }
//   );
// };
