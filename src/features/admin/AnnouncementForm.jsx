import React, { useState, useEffect } from 'react';
import { Loader2, Save, Sparkles, AlertCircle, Type, CalendarDays, CheckSquare, XSquare } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { generateAnnouncement } from '../../services/geminiService.js';
import Modal from '../../components/ui/Modal.jsx';

const AnnouncementForm = ({ initialData = null, onSubmit, onCancel, isSaving, showNotification }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('active');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setContent(initialData.content || '');
            setStatus(initialData.status || 'active');
            setStartDate(initialData.startDate?.toDate ? initialData.startDate.toDate().toISOString().split('T')[0] : '');
            setEndDate(initialData.endDate?.toDate ? initialData.endDate.toDate().toISOString().split('T')[0] : '');
        } else {
            const today = new Date().toISOString().split('T')[0];
            setStartDate(today);
            setStatus('active');
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError('');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        if (!title.trim() || !tempDiv.textContent.trim() || !startDate) {
            setFormError("Title, Content, and Start Date are required.");
            return;
        }
        if (endDate && new Date(endDate) < new Date(startDate)) {
            setFormError("End date cannot be before start date.");
            return;
        }

        const announcementData = {
            title,
            content,
            status,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
        };
        onSubmit(announcementData);
    };
    
    const commonInputClass = "w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition duration-200 text-gray-900";
    const commonButtonClass = "flex items-center justify-center px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-60 active:scale-95";
    
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link'],
            ['clean']
        ],
    };

    return (
        <>
            <form onSubmit={handleSubmit} id="announcementForm" className="space-y-6">
                {formError && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm flex items-center">
                        <AlertCircle size={20} className="mr-2" /> {formError}
                    </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-grow w-full">
                        <label htmlFor="announcementTitle" className="block text-sm font-medium text-gray-700 mb-1"><Type size={16} className="inline mr-1.5" />Title *</label>
                        <input type="text" id="announcementTitle" value={title} onChange={(e) => setTitle(e.target.value)} className={commonInputClass} required />
                    </div>
                     <div className="w-full sm:w-auto flex-shrink-0 pt-0 sm:pt-6">
                         <button type="button" onClick={() => setIsAiWizardOpen(true)} className={`${commonButtonClass} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 w-full`}>
                             <Sparkles size={18} className="mr-2" /> AI Content Wizard
                         </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                    <div className="bg-white rounded-lg">
                        <ReactQuill 
                            theme="snow" 
                            value={content} 
                            onChange={setContent}
                            modules={quillModules}
                            className="h-64 mb-12"
                        />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <button type="button" onClick={() => setStatus(status === 'active' ? 'archived' : 'active')} className={`${commonButtonClass} w-full ${status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-300'}`}>
                            {status === 'active' ? <CheckSquare size={18} className="mr-2" /> : <XSquare size={18} className="mr-2" />}
                            {status === 'active' ? 'Active' : 'Archived'}
                        </button>
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1"><CalendarDays size={16} className="inline mr-1.5" />Start Date *</label>
                        <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={commonInputClass} required />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1"><CalendarDays size={16} className="inline mr-1.5" />End Date (Optional)</label>
                        <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={commonInputClass} min={startDate} />
                    </div>
                </div>
                 <div className="w-full pt-6 border-t flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                     <button type="button" onClick={onCancel} className={`${commonButtonClass} bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 focus:ring-gray-300 w-full sm:w-auto order-2 sm:order-1`} disabled={isSaving}>Cancel</button>
                     <button type="submit" form="announcementForm" className={`${commonButtonClass} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 w-full sm:w-auto order-1 sm:order-2`} disabled={isSaving}>
                        {isSaving ? <Loader2 size={20} className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
                        {isSaving ? 'Saving...' : (initialData ? 'Update Announcement' : 'Create Announcement')}
                     </button>
                </div>
            </form>

            {isAiWizardOpen && (
                <AiWizardModal
                    isOpen={isAiWizardOpen}
                    onClose={() => setIsAiWizardOpen(false)}
                    onGenerate={(generatedContent, generatedTitle) => {
                        setContent(generatedContent);
                        if (generatedTitle) setTitle(generatedTitle);
                        setIsAiWizardOpen(false);
                        showNotification("AI content has been added to the editor!", "success");
                    }}
                    showNotification={showNotification}
                />
            )}
        </>
    );
};

const AiWizardModal = ({ isOpen, onClose, onGenerate, showNotification }) => {
    const [reason, setReason] = useState('');
    const [area, setArea] = useState('');
    const [time, setTime] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!reason.trim()) {
            showNotification("Please provide a reason for the announcement.", "warning");
            return;
        }
        setIsGenerating(true);
        try {
            const generatedContent = await generateAnnouncement({ reason, area, time });
            onGenerate(generatedContent, reason);
        } catch (error) {
            showNotification(error.message || "AI Wizard failed to generate content.", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Announcement Wizard" size="lg">
            <div className="space-y-4">
                 <p className="text-sm text-gray-600">Fill in the key details below and AI will generate a complete, professional announcement for you.</p>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Event *</label>
                    <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-2 border rounded-md" placeholder="E.g., Emergency Mainline Repair" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Affected Area(s)</label>
                    <input type="text" value={area} onChange={(e) => setArea(e.target.value)} className="w-full p-2 border rounded-md" placeholder="E.g., Brgy. Sapa, Coastal District" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time of Event</label>
                    <input type="text" value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-2 border rounded-md" placeholder="E.g., Sept 25, 2025, 10 PM to 4 AM" />
                </div>
                <div className="pt-4 flex justify-end">
                    <button onClick={handleGenerate} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center" disabled={isGenerating}>
                        {isGenerating ? <Loader2 size={18} className="animate-spin mr-2" /> : <Sparkles size={18} className="mr-2" />}
                        {isGenerating ? 'Generating...' : 'Generate & Use Content'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AnnouncementForm;