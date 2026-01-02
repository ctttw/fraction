import React, { useState } from 'react';
import { X, Send, AlertTriangle, FilePlus, CheckCircle2 } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, apiUrl }) => {
  const [activeTab, setActiveTab] = useState<'score' | 'error'>('score');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
      school: '',
      department: '',
      score: '',
      points: '',
      note: '',
      errorSchool: '',
      errorDescription: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = activeTab === 'score' 
        ? {
            type: 'report_score',
            school: formData.school,
            department: formData.department,
            score: formData.score,
            points: formData.points,
            note: formData.note,
            submittedAt: new Date().toISOString()
        }
        : {
            type: 'report_error',
            school: formData.errorSchool,
            description: formData.errorDescription,
            submittedAt: new Date().toISOString()
        };

    try {
        if (!apiUrl) {
             // Mock submission if no API URL
             await new Promise(resolve => setTimeout(resolve, 800));
             console.log("Mock Submission:", payload);
        } else {
             // Send data to Google Apps Script
             // Note: using 'no-cors' mode is common for GAS POST requests from browser 
             // but it yields an opaque response. If your GAS returns proper CORS headers, 
             // you can remove mode: 'no-cors'.
             
             // Using standard fetch expecting JSON response.
             // GAS must handle OPTIONS and allow origin.
             await fetch(apiUrl, {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'text/plain;charset=utf-8', // Avoids preflight in some cases
                 },
                 body: JSON.stringify(payload)
             });
        }
        
        alert("感謝您的回報！我們已收到您的資訊，審核通過後將更新至平台。");
        onClose();
        // Reset form
        setFormData({
            school: '',
            department: '',
            score: '',
            points: '',
            note: '',
            errorSchool: '',
            errorDescription: ''
        });

    } catch (error) {
        console.error("Submission error:", error);
        alert("傳送失敗，請稍後再試。");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${activeTab === 'score' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
               {activeTab === 'score' ? <FilePlus className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </div>
            <h3 className="text-lg font-bold text-gray-800">協助完善資料</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all relative ${
              activeTab === 'score' 
                ? 'text-blue-600 bg-blue-50/50' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('score')}
          >
            回報新分數
            {activeTab === 'score' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
            )}
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all relative ${
              activeTab === 'error' 
                ? 'text-red-600 bg-red-50/50' 
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('error')}
          >
            錯誤回報
            {activeTab === 'error' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {activeTab === 'score' ? (
              <>
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 flex gap-2 items-start">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>您的熱心分享將造福更多學子！請提供今年度最新的錄取數據。</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">學校名稱 <span className="text-red-500">*</span></label>
                    <input required name="school" value={formData.school} onChange={handleInputChange} type="text" placeholder="例如：台中一中" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">科系/組別 <span className="text-red-500">*</span></label>
                    <input required name="department" value={formData.department} onChange={handleInputChange} type="text" placeholder="例如：普通科" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">錄取積分 <span className="text-red-500">*</span></label>
                    <input required name="score" value={formData.score} onChange={handleInputChange} type="number" placeholder="例如：30" min="0" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">錄取積點 <span className="text-red-500">*</span></label>
                    <input required name="points" value={formData.points} onChange={handleInputChange} type="number" placeholder="例如：95" min="0" max="111" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" />
                  </div>
                </div>
                
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1.5">備註說明 (選填)</label>
                   <textarea name="note" value={formData.note} onChange={handleInputChange} rows={2} placeholder="例如：作文分數、錄取梯次等補充資訊..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none text-sm"></textarea>
                </div>
              </>
            ) : (
              <>
                 <div className="bg-red-50 p-3 rounded-lg text-sm text-red-800 flex gap-2 items-start">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>發現資料有誤？請告訴我們正確的資訊，我們將盡快修正。</p>
                </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">發現錯誤的學校/科系 <span className="text-red-500">*</span></label>
                    <input required name="errorSchool" value={formData.errorSchool} onChange={handleInputChange} type="text" placeholder="例如：台中女中 普通科" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">錯誤描述與正確資訊 <span className="text-red-500">*</span></label>
                    <textarea required name="errorDescription" value={formData.errorDescription} onChange={handleInputChange} rows={4} placeholder="請描述錯誤內容，例如：積點應為 92 而非 90..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all resize-none text-sm"></textarea>
                  </div>
              </>
            )}

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                } ${
                    activeTab === 'score' 
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200' 
                    : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200'
                }`}
              >
                {isSubmitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                    <Send className="h-4 w-4" />
                )}
                {isSubmitting ? '傳送中...' : '送出回報'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;