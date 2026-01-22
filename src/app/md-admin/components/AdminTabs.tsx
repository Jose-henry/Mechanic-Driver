'use client';

import { useState } from 'react';
import { ClipboardList, Users, FileText, DollarSign } from 'lucide-react';
import RequestsTab from './RequestsTab';
import DriversTab from './DriversTab';
import QuotesTab from './QuotesTab';
import PricingTab from './PricingTab';

interface AdminTabsProps {
    requests: any[];
    drivers: any[];
    quotes: any[];
    servicePrices: any[];
}

const TABS = [
    { id: 'requests', label: 'Requests', icon: ClipboardList, count: 0 },
    { id: 'drivers', label: 'Drivers', icon: Users, count: 0 },
    { id: 'quotes', label: 'Quotes', icon: FileText, count: 0 },
    { id: 'pricing', label: 'Service Prices', icon: DollarSign, count: 0 },
];

export default function AdminTabs({ requests, drivers, quotes, servicePrices }: AdminTabsProps) {
    const [activeTab, setActiveTab] = useState('requests');

    const tabsWithCounts = TABS.map(tab => ({
        ...tab,
        count: tab.id === 'requests' ? requests.length :
            tab.id === 'drivers' ? drivers.length :
                tab.id === 'quotes' ? quotes.length :
                    tab.id === 'pricing' ? servicePrices.length : 0
    }));

    return (
        <div>
            {/* Tab Navigation */}
            <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-8 border-b border-[#222] pb-3 sm:pb-4 overflow-x-auto scrollbar-hide">
                {tabsWithCounts.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0
                                ${isActive
                                    ? 'bg-lime-500 text-black'
                                    : 'bg-[#1A1A1A] text-gray-400 hover:bg-[#222] hover:text-white'
                                }
                            `}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden xs:inline sm:inline">{tab.label}</span>
                            <span className={`
                                px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs
                                ${isActive ? 'bg-black/20 text-black' : 'bg-[#333] text-gray-500'}
                            `}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in duration-300">
                {activeTab === 'requests' && <RequestsTab requests={requests} drivers={drivers} />}
                {activeTab === 'drivers' && <DriversTab drivers={drivers} />}
                {activeTab === 'quotes' && <QuotesTab quotes={quotes} requests={requests} drivers={drivers} />}
                {activeTab === 'pricing' && <PricingTab servicePrices={servicePrices} />}
            </div>
        </div>
    );
}
