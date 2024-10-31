import { Suspense } from "react";
import Loading from "@/app/_components/ui/loading";
import VCSStatus from "./VCSStatus";
import SideMenu from "../_components/navigation/SideMenu";

const VCSPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <SideMenu>
        <VCSStatus />
      </SideMenu>
    </Suspense>
  );
};

export default VCSPage;
