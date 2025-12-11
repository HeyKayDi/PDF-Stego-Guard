import React, { useState } from 'react';
import FileDropzone from './FileDropzone';
import Button from './Button';
import { extractFileFromPdf, downloadBlob } from '../services/pdfUtils';
import { analyzeHiddenFileContent } from '../services/geminiService';
import { ProcessingStatus, ExtractResult } from '../types';

const ExtractTab: React.FC = () => {
  const [stegoPdf, setStegoPdf] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [result, setResult] = useState<ExtractResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  const handleReset = () => {
    setStegoPdf(null);
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
    setAiAnalysis('');
  };

  const processExtract = async () => {
    if (!stegoPdf) return;

    setStatus('processing');
    setErrorMsg('');
    setResult(null);
    setAiAnalysis('');

    try {
      // Small delay for UI
      await new Promise(r => setTimeout(r, 500));

      const extractData = await extractFileFromPdf(stegoPdf);
      setResult(extractData);
      setStatus('success');

      // Trigger AI Analysis on the extracted file
      setAnalyzing(true);
      const analysis = await analyzeHiddenFileContent(
          extractData.fileData, 
          extractData.metadata.mimeType, 
          extractData.metadata.fileName
      );
      setAiAnalysis(analysis);
      setAnalyzing(false);

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || "Không tìm thấy dữ liệu ẩn hoặc file bị lỗi.");
    }
  };

  const handleDownloadExtracted = () => {
    if (result) {
      // Ép kiểu as BlobPart để sửa lỗi TypeScript
      const blob = new Blob([result.fileData as BlobPart], { type: result.metadata.mimeType });
      downloadBlob(blob, result.metadata.fileName);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg text-xl">🔓</span>
          Trích xuất dữ liệu
        </h2>

        <div className="max-w-xl mx-auto space-y-6">
          <div className="space-y-2">
             <label className="block text-sm font-medium text-slate-700">Tải lên file PDF cần giải mã</label>
             <FileDropzone 
               label="Kéo thả file PDF có chứa dữ liệu ẩn"
               accept="application/pdf"
               currentFile={stegoPdf}
               onFileSelect={setStegoPdf}
               onClear={handleReset}
             />
          </div>

          <div className="flex justify-center pt-4">
             <Button 
               onClick={processExtract}
               disabled={!stegoPdf || status === 'success'}
               isLoading={status === 'processing'}
               className="w-full md:w-auto min-w-[200px]"
             >
               {status === 'success' ? 'Đã tìm thấy file!' : 'Quét và Trích xuất'}
             </Button>
          </div>
          
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center text-sm">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Result Area */}
        {status === 'success' && result && (
          <div className="mt-8 border-t border-slate-100 pt-8 animate-fade-in">
             <h3 className="text-lg font-semibold text-slate-800 mb-4">Kết quả trích xuất</h3>
             
             <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 grid md:grid-cols-2 gap-6">
                
                {/* File Info */}
                <div className="space-y-4">
                   <div className="flex items-start gap-4">
                      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                         </svg>
                      </div>
                      <div>
                         <p className="font-bold text-slate-800 text-lg">{result.metadata.fileName}</p>
                         <p className="text-slate-500 text-sm">{(result.metadata.fileSize / 1024).toFixed(2)} KB</p>
                         <p className="text-slate-400 text-xs mt-1">{result.metadata.mimeType}</p>
                         <p className="text-slate-400 text-xs">Ngày ẩn: {new Date(result.metadata.timestamp).toLocaleString()}</p>
                      </div>
                   </div>
                   <Button onClick={handleDownloadExtracted} variant="primary" className="w-full">
                      Tải xuống file gốc
                   </Button>
                </div>

                {/* AI Analysis */}
                <div className="bg-white rounded-lg p-4 border border-indigo-100 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-2 opacity-10">
                      <svg className="w-24 h-24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/></svg>
                   </div>
                   <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      AI Insight
                   </h4>
                   {analyzing ? (
                      <div className="flex flex-col gap-2">
                         <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4"></div>
                         <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
                         <div className="h-4 bg-slate-100 rounded animate-pulse w-5/6"></div>
                      </div>
                   ) : (
                      <p className="text-sm text-slate-600 leading-relaxed">
                         {aiAnalysis}
                      </p>
                   )}
                </div>

             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtractTab;