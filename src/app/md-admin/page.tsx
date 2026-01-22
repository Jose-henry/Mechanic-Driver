import { createClient } from "@/utils/supabase/server";
import { Suspense } from "react";
import AdminTabs from "./components/AdminTabs";

async function fetchAdminData() {
    const supabase = await createClient();

    const [requestsRes, driversRes, quotesRes, pricesRes] = await Promise.all([
        supabase.from('requests').select('*, profiles!user_id(full_name, phone), drivers!mechanic_driver_id(full_name)').order('created_at', { ascending: false }),
        supabase.from('drivers').select('*').order('created_at', { ascending: false }),
        supabase.from('quotes').select('*, requests!request_id(brand, model, year)').order('created_at', { ascending: false }),
        supabase.from('service_prices').select('*').order('key', { ascending: true }),
    ]);

    return {
        requests: requestsRes.data || [],
        drivers: driversRes.data || [],
        quotes: quotesRes.data || [],
        servicePrices: pricesRes.data || [],
    };
}

export default async function AdminPage() {
    const data = await fetchAdminData();

    return (
        <div>
            <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
                <AdminTabs
                    requests={data.requests}
                    drivers={data.drivers}
                    quotes={data.quotes}
                    servicePrices={data.servicePrices}
                />
            </Suspense>
        </div>
    );
}
