import { Suspense } from 'react';
import Loading from '@/app/_components/ui/loading';
import VCSStatus from './VCSStatus';


const VCSPage = () => {
    return (
            <Suspense fallback={<Loading />}>
                <VCSStatus />
            </Suspense>
    )
};

export default VCSPage;