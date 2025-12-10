# PDF Stego Guard 🔒

**PDF Stego Guard** là một ứng dụng web bảo mật sử dụng kỹ thuật **Steganography** (giấu tin) để nhúng các tệp tin bí mật vào bên trong cấu trúc của một file PDF bình thường mà không làm thay đổi nội dung hiển thị của file đó. 

Dự án tích hợp **Google Gemini AI** để tự động phân tích và tóm tắt nội dung của văn bản, mang lại trải nghiệm thông minh hơn cho người dùng.

## 🚀 Tính năng chính

- **Ẩn dữ liệu (Steganography):** Nhúng bất kỳ loại file nào (ảnh, text, zip...) vào trong file PDF.
- **Trích xuất dữ liệu:** Tách file ẩn ra khỏi PDF đã được nhúng.
- **AI Analysis:** Sử dụng Gemini 2.5 Flash để:
  - Tóm tắt nội dung file PDF gốc.
  - Phân tích nội dung file ẩn sau khi trích xuất.
- **Bảo mật Client-side:** Mọi quá trình xử lý diễn ra ngay trên trình duyệt, file không được gửi lên máy chủ lưu trữ trung gian.
- **Giao diện hiện đại:** Thiết kế với React, Tailwind CSS và hiệu ứng mượt mà.

## 🛠️ Yêu cầu hệ thống

Trước khi cài đặt, hãy đảm bảo máy tính của bạn đã cài đặt:

- **Node.js** (Phiên bản 18 trở lên khuyến nghị).
- Trình quản lý gói **npm** (đi kèm với Node.js).
- Một **API Key** từ Google AI Studio (Gemini API).

## ⚙️ Hướng dẫn cài đặt

1. **Tải mã nguồn về máy** (nếu bạn chưa có):
   Giải nén thư mục dự án.

2. **Cài đặt các thư viện phụ thuộc:**
   Mở Terminal tại thư mục gốc của dự án và chạy lệnh:
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường (Environment Variables):**
   - Tạo một file tên là `.env` tại thư mục gốc (ngang hàng với `package.json`).
   - Mở file `.env` và dán nội dung sau vào:
     ```env
     API_KEY=AIzaSy... (Dán mã API Key của bạn vào đây)
     ```

   > **Cách lấy API Key:**
   > 1. Truy cập [Google AI Studio](https://aistudio.google.com/app/apikey).
   > 2. Đăng nhập Google và chọn "Create API key".
   > 3. Copy chuỗi ký tự bắt đầu bằng `AIza...` và dán vào file `.env`.

## ▶️ Cách chạy dự án

1. **Khởi chạy môi trường phát triển (Development Server):**
   Tại Terminal, chạy lệnh:
   ```bash
   npm run dev
   ```

2. **Mở trình duyệt:**
   Sau khi chạy lệnh trên, Terminal sẽ hiện ra một đường dẫn (thường là `http://localhost:5173/`). Giữ phím `Ctrl` và click vào link đó để mở ứng dụng.

## 📦 Build cho Production

Nếu bạn muốn đóng gói ứng dụng để đưa lên host (ví dụ Vercel, Netlify):

```bash
npm run build
```
File sau khi build sẽ nằm trong thư mục `dist`.

## 🗂️ Cấu trúc dự án

- `src/index.tsx`: Điểm khởi chạy của React.
- `src/App.tsx`: Layout chính và điều hướng.
- `src/services/pdfUtils.ts`: Logic cốt lõi để xử lý file PDF (nhị phân, nối file).
- `src/services/geminiService.ts`: Kết nối với Google Gemini API.
- `src/components/`: Các thành phần giao diện (Dropzone, Button, Tab...).

## 🛡️ Cơ chế hoạt động

Ứng dụng lợi dụng đặc điểm của định dạng PDF: Các trình đọc PDF thường chỉ đọc đến dấu hiệu kết thúc file (`%%EOF`). Dữ liệu được nối vào phía sau dấu hiệu này sẽ bị bỏ qua khi hiển thị nhưng vẫn tồn tại vật lý trong file.

---
**Lưu ý:** Dự án này được xây dựng cho mục đích giáo dục và nghiên cứu về an toàn thông tin.
