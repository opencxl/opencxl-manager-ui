import { Suspense } from 'react';
import Loading from '@/components/ui/loading';
import SideMenu from '@/components/navigation/SideMenu';
import VCSStatus from './VCSStatus';


const VCSPage = () => {
    return (
        <SideMenu>
            <Suspense fallback={<Loading />}>
                <VCSStatus />
            </Suspense>
        </SideMenu>
    )
};

export default VCSPage;