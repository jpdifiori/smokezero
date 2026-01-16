import { getUserConfig } from '@/lib/user-config'
import { redirect } from 'next/navigation'
import { SetupForm } from '@/components/profile/SetupForm'

export default async function SetupPage() {
    const config = await getUserConfig();

    // SERVER SIDE CHECK: No flash of content!
    if (config?.setup_completed) {
        redirect('/dashboard');
    }

    return <SetupForm />;
}
