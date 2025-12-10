import React, { useState } from 'react';
import { AppMode } from './types';
import HideTab from './components/HideTab';
import ExtractTab from './components/ExtractTab';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);

  const renderContent = () => {
    switch (mode) {
      case AppMode.HIDE:
        return <HideTab />;
      case AppMode.EXTRACT:
        return <ExtractTab />;
      default:
        return (
          <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up max-w-4xl mx-auto">
            <div 
              onClick={() => setMode(AppMode.HIDE)}
              className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Ẩn dữ liệu</h2>
                <p className="text-slate-500 mb-4">Nhúng tệp tin bí mật vào trong một file PDF bình thường. File PDF vẫn xem được nhưng chứa "kho báu" bên trong.</p>
                <span className="text-blue-600 font-medium group-hover:translate-x-1 inline-block transition-transform">Bắt đầu ngay &rarr;</span>
              </div>
            </div>

            <div 
              onClick={() => setMode(AppMode.EXTRACT)}
              className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Trích xuất</h2>
                <p className="text-slate-500 mb-4">Tải lên file PDF đã qua xử lý để lấy lại tệp tin bí mật. Hệ thống tự động phát hiện và tách dữ liệu.</p>
                <span className="text-emerald-600 font-medium group-hover:translate-x-1 inline-block transition-transform">Bắt đầu ngay &rarr;</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setMode(AppMode.HOME)}
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
              PDF Stego Guard
            </h1>
          </div>
          
          <nav className="flex items-center gap-1">
            <button 
              onClick={() => setMode(AppMode.HOME)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === AppMode.HOME ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Trang chủ
            </button>
            <button 
              onClick={() => setMode(AppMode.HIDE)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === AppMode.HIDE ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Ẩn file
            </button>
            <button 
              onClick={() => setMode(AppMode.EXTRACT)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === AppMode.EXTRACT ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Trích xuất
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Helper Info Section */}
        {mode === AppMode.HOME && (
          <div className="mb-12 text-center max-w-2xl mx-auto">
             <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
               Bảo mật dữ liệu bằng kỹ thuật Steganography
             </h2>
             <p className="text-lg text-slate-600">
               Công nghệ ẩn giấu dữ liệu nhạy cảm vào bên trong cấu trúc file PDF mà không làm thay đổi nội dung hiển thị của file gốc.
             </p>
          </div>
        )}

        {renderContent()}

        {/* Technical Info Footnote */}
        {mode === AppMode.HOME && (
          <div className="mt-20 pt-10 border-t border-slate-200">
             <div className="grid md:grid-cols-3 gap-8 text-sm">
                <div>
                   <h3 className="font-semibold text-slate-900 mb-2">Nguyên lý hoạt động</h3>
                   <p className="text-slate-500">File PDF có cấu trúc đánh dấu kết thúc bằng `%%EOF`. Dữ liệu mới được nối vào sau dấu hiệu này sẽ bị các trình đọc PDF bỏ qua, giữ nguyên hiển thị gốc.</p>
                </div>
                <div>
                   <h3 className="font-semibold text-slate-900 mb-2">AI Integration</h3>
                   <p className="text-slate-500">Sử dụng Google Gemini 2.5 Flash để phân tích và tóm tắt nội dung của cả file PDF gốc lẫn file dữ liệu được trích xuất.</p>
                </div>
                <div>
                   <h3 className="font-semibold text-slate-900 mb-2">Bảo mật</h3>
                   <p className="text-slate-500">Mọi xử lý đều diễn ra tại trình duyệt (Client-side). File của bạn không bao giờ được gửi lên máy chủ lưu trữ trung gian.</p>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;