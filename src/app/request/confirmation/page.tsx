import { Navbar } from '@/components/Navbar';
import { ConfirmationContent } from './ConfirmationContent';
import { Suspense } from 'react';

export default function ConfirmationPage() {
    return (
        <main className="bg-[#FDFDFD] min-h-screen flex flex-col">
            <Navbar />
            <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
                <ConfirmationContent />
            </Suspense>
        </main>
    );
}
