import React, { useState } from 'react';
import FileDropzone from './FileDropzone';
import Button from './Button';
import { embedFileInPdf, downloadBlob } from '../services/pdfUtils';
import { analyzePdfContent } from '../services/geminiService';
import { ProcessingStatus } from '../types';

const HideTab: React.FC = () => {
  const [carrierPdf, setCarrierPdf] = useState<File | null>(null);
  const [secretFile, setSecretFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [aiSummary, setAiSummary] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleReset = () => {
    setCarrierPdf(null);
    setSecretFile(null);
    setStatus('idle');
    setErrorMsg('');
    setAiSummary('');
  };

  const handleCarrierSelect = async (file: File) => {
    setCarrierPdf(file);
    // Auto analyze PDF content for better UX
    setAnalyzing(true);
    const summary = await analyzePdfContent(file);
    setAiSummary(summary);
    setAnalyzing(false);
  };

  const processHide = async () => {
    if (!carrierPdf || !secretFile) return;

    setStatus('processing');
    setErrorMsg('');
    
    try {
      // Simulate a small delay for better UX
      await new Promise(r => setTimeout(r, 800));
      
      const newPdfBlob = await embedFileInPdf(carrierPdf, secretFile);
      downloadBlob(newPdfBlob, `protected_${carrierPdf.name}`);
      
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || "Có lỗi xảy ra khi ẩn file.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-600 p-2 rounded-lg text-xl">🔒</span>
          Ẩn dữ liệu vào PDF
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Step 1: Carrier PDF */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">1. Select the PDF file containing (Carrier)</h3>
            <FileDropzone 
              label="Drag and drop the PDF file here"
              subLabel="Supports .pdf format"
              accept="application/pdf"
              currentFile={carrierPdf}
              onFileSelect={handleCarrierSelect}
              onClear={() => { setCarrierPdf(null); setAiSummary(''); }}
            />
            
            {/* AI Summary Section */}
            {(analyzing || aiSummary) && (
               <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                     <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                     <span className="font-semibold text-sm text-slate-700">AI PDF Content Analysis</span>
                  </div>
                  {analyzing ? (
                    <div className="text-sm text-slate-500 animate-pulse">Reading file content...</div>
                  ) : (
                    <p className="text-sm text-slate-600 leading-relaxed italic">"{aiSummary}"</p>
                  )}
               </div>
            )}
          </div>

          {/* Step 2: Secret File */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">2. Select the file to hide (Secret Payload)</h3>
            <FileDropzone 
              label="Drag and drop the secret file here"
              subLabel="Any format (Image, Text, Zip...)"
              currentFile={secretFile}
              onFileSelect={setSecretFile}
              onClear={() => setSecretFile(null)}
            />
            <div className="bg-amber-50 text-amber-800 text-sm p-4 rounded-xl border border-amber-100 flex gap-3">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <p>Secret file will be embedded into the PDF file structure. Normal users opening the PDF will still see the original PDF content as normal.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
          {errorMsg && <p className="text-red-600 text-sm font-medium">{errorMsg}</p>}
          {status === 'success' && (
             <p className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                File downloaded successfully!
             </p>
          )}
          
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={status === 'processing'}
          >
            Reset
          </Button>
          <Button 
            onClick={processHide}
            disabled={!carrierPdf || !secretFile}
            isLoading={status === 'processing'}
          >
            Hide & Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HideTab;
