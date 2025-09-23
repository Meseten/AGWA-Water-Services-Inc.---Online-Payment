import React, { useState, useEffect, useCallback } from "react";
import { BarChart3, Users, MessageSquare, RotateCcw, Loader2, Info, Printer, DollarSign } from "lucide-react";
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import * as DataService from "../../services/dataService.js";
import { db } from "../../firebase/firebaseConfig.js";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const StatisticsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStatistics = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const results = await Promise.allSettled([
                DataService.getUsersStats(db),
                DataService.getTicketsStats(db),
                DataService.getDailyRevenueStats(db, 30)
            ]);

            const [usersResult, ticketsResult, dailyRevenueResult] = results;
            
            const newStats = {};
            if (usersResult.status === 'fulfilled' && usersResult.value.success) {
                newStats.usersByRole = usersResult.value.data.byRole;
                newStats.totalUsers = usersResult.value.data.total;
            }
            if (ticketsResult.status === 'fulfilled' && ticketsResult.value.success) newStats.ticketStats = ticketsResult.value.data;
            if (dailyRevenueResult.status === 'fulfilled' && dailyRevenueResult.value.success) newStats.dailyRevenue = dailyRevenueResult.value.data;
            
            setStats(newStats);
        } catch (e) {
            setError("A critical error occurred while fetching statistics.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);
    
    const handlePrintReport = () => {
        window.print();
    };
    
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, font: { size: 16 } },
        },
    };

    const dailyRevenueData = {
        labels: stats?.dailyRevenue ? Object.keys(stats.dailyRevenue).map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) : [],
        datasets: [{
            label: 'Daily Revenue (PHP)',
            data: stats?.dailyRevenue ? Object.values(stats.dailyRevenue) : [],
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
            fill: true,
            tension: 0.3,
        }],
    };
    
    const usersByRoleData = {
        labels: stats?.usersByRole ? Object.keys(stats.usersByRole).map(role => role.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())) : [],
        datasets: [{
            label: 'Users by Role',
            data: stats?.usersByRole ? Object.values(stats.usersByRole) : [],
            backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(139, 92, 246, 0.8)'],
            borderColor: ['#fff'],
            borderWidth: 2,
        }],
    };
    
    const ticketsByStatusData = {
        labels: stats?.ticketStats ? Object.keys(stats.ticketStats).filter(k => k !== 'total') : [],
        datasets: [{
            label: 'Tickets by Status',
            data: stats?.ticketStats ? Object.entries(stats.ticketStats).filter(([k]) => k !== 'total').map(([,v])=>v) : [],
            backgroundColor: ['rgba(239, 68, 68, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)'],
            borderColor: ['rgb(239, 68, 68)', 'rgb(245, 158, 11)', 'rgb(59, 130, 246)', 'rgb(16, 185, 129)'],
            borderWidth: 1,
        }],
    };
    
    const totalRevenue = stats?.dailyRevenue ? Object.values(stats.dailyRevenue).reduce((sum, val) => sum + val, 0) : 0;
    const avgDailyRevenue = totalRevenue / (stats?.dailyRevenue ? Object.keys(stats.dailyRevenue).length || 1 : 1);

    if (isLoading) {
        return <LoadingSpinner message="Loading system analytics..." className="mt-10 h-64" />;
    }

    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xl animate-fadeIn">
             <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 no-print">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                    <BarChart3 size={30} className="mr-3 text-orange-600" /> System Analytics & Reports
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={fetchStatistics} disabled={isLoading} className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg border border-gray-300">
                        {isLoading ? <Loader2 size={16} className="animate-spin mr-2"/> : <RotateCcw size={16} className="mr-2" />}
                        Refresh
                    </button>
                    <button onClick={handlePrintReport} className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-3 rounded-lg">
                        <Printer size={16} className="mr-2"/> Print Report
                    </button>
                </div>
            </div>

            {error && <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 my-4 flex items-center no-print" role="alert"><Info size={20} className="mr-3" /><p>{error}</p></div>}
            
            <div id="stats-print-area">
                <header className="hidden print:block text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-700">AGWA System Analytics Report</h1>
                    <p className="text-sm text-gray-500">Generated on: {new Date().toLocaleString()}</p>
                </header>

                <div className="space-y-8">
                    <section className="print-section">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center"><p className="text-sm font-semibold uppercase text-green-700">Total Revenue (Last 30 Days)</p><p className="text-3xl font-bold text-green-800">₱{totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2})}</p></div>
                            <div className="p-4 bg-gray-50 border rounded-lg text-center"><p className="text-sm font-semibold uppercase text-gray-600">Avg. Revenue / Day</p><p className="text-3xl font-bold">₱{avgDailyRevenue.toLocaleString('en-US', {minimumFractionDigits: 2})}</p></div>
                            <div className="p-4 bg-gray-50 border rounded-lg text-center"><p className="text-sm font-semibold uppercase text-gray-600">Total Users</p><p className="text-3xl font-bold">{stats?.totalUsers || 0}</p></div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border">
                           <Line options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Daily Revenue (Last 30 Days)'}}}} data={dailyRevenueData} />
                        </div>
                    </section>
                    
                    <section className="print-section grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                        <div className="p-4 bg-gray-50 rounded-lg border flex flex-col items-center">
                             <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center"><Users size={22} className="mr-2 text-blue-600"/>Users by Role</h3>
                             <div className="w-full max-w-[300px] h-[300px]">
                                <Doughnut options={{...chartOptions, plugins: {...chartOptions.plugins, legend: {position: 'bottom'}}}} data={usersByRoleData} />
                             </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border">
                             <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center"><MessageSquare size={22} className="mr-2 text-purple-600"/>Support Tickets by Status</h3>
                             <Bar options={{...chartOptions, indexAxis: 'y'}} data={ticketsByStatusData} />
                        </div>
                    </section>
                </div>
                 <footer className="hidden print:block text-center text-xs text-gray-500 mt-12 pt-4 border-t">
                    End of Report - © AGWA Water Services Inc.
                </footer>
            </div>
        </div>
    );
};

export default StatisticsDashboard;