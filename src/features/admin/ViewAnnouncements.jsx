import React from 'react';
import { Edit2, Trash2, Eye, EyeOff, Info as InfoIcon, Loader2 } from 'lucide-react';
import DOMPurify from 'dompurify';

const ViewAnnouncements = ({ announcements, onEdit, onDelete, onToggleStatus, actionLoadingId, viewOnly = false }) => {

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        let date;
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
            date = timestamp.toDate();
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else {
            return 'Invalid Date';
        }
        return date.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (!announcements || announcements.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 p-6 rounded-lg shadow-inner">
                <InfoIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">No announcements found.</p>
                {!viewOnly && <p className="text-sm text-gray-500 mt-1">Create a new announcement to get started.</p>}
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            {announcements.map(ann => (
                <div key={ann.id} className={`p-4 rounded-lg shadow-md border-l-4 transition-opacity ${ann.status === 'active' ? 'border-green-500 bg-white' : 'border-gray-400 bg-gray-50 opacity-80'}`}>
                    <div className="flex justify-between items-start">
                        <div className="flex-grow pr-4">
                            <h4 className="text-lg font-semibold text-gray-800">{ann.title}</h4>
                             <span className={`px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full ${ann.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                {ann.status}
                            </span>
                        </div>
                        
                        {!viewOnly && (
                            <div className="flex space-x-2 items-center flex-shrink-0">
                                {actionLoadingId === ann.id ? <Loader2 className="animate-spin text-gray-500" /> : (
                                    <>
                                        <button onClick={() => onToggleStatus(ann)} className={`p-1.5 rounded-md hover:bg-opacity-20 transition-colors ${ann.status === 'active' ? 'text-yellow-600 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}`} title={ann.status === 'active' ? "Archive" : "Activate"}>
                                            {ann.status === 'active' ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        <button onClick={() => onEdit(ann)} className="text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-100 transition-colors" title="Edit">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => onDelete(ann.id)} className="text-red-600 hover:text-red-800 p-1.5 rounded-md hover:bg-red-100 transition-colors" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="prose prose-sm max-w-none text-gray-700 mt-3 pt-3 border-t border-gray-200/80 leading-relaxed"
                         dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ann.content) }}
                    >
                    </div>
                    <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200/80">
                        <p>Display Period: {formatDate(ann.startDate)} to {ann.endDate ? formatDate(ann.endDate) : 'Ongoing'}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ViewAnnouncements;