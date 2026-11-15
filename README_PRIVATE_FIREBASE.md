# Thiết lập Firebase cho hộp thư bí mật / Firebase 私密信箱

Website hiện đã có giao diện **fan gửi thư → phong thư niêm phong → người nhận mở sau lá thư chính**, nhưng chưa thể kết nối dữ liệu thật cho đến khi bạn thêm cấu hình dự án Firebase.

**Hệ lưu trữ đã chuẩn bị trong code: Cloud Firestore**. Nếu Firebase bạn tạo là **Realtime Database** (không phải Cloud Firestore), đừng dán nhầm bộ Rules này. Hãy chuyển adapter `src/services/privateLetters.ts` sang Realtime Database trước khi bật gửi.

## 1. Bật Firebase Authentication

Truy cập [Firebase Console](https://console.firebase.google.com/) và chọn dự án website sinh nhật.

Vào **Build → Authentication → Sign-in method**:

- Bật **Anonymous**: để fan gửi thư *không cần tạo tài khoản*.
- Bật **Email/Password**: để chỉ tài khoản của người nhận đăng nhập đọc thư.

Vào **Authentication → Users → Add user**, tạo **một tài khoản dành riêng cho người nhận** (email và mật khẩu mạnh). Chỉ chia sẻ thông tin đăng nhập với người nhận thật. **Không đưa email, mật khẩu, refresh token vào code, GitHub, ChatGPT hay nội dung website.**

Sao chép **UID** của tài khoản này từ danh sách Users, không phải mật khẩu. UID không phải thông tin đăng nhập, và dùng UID để chỉ định ai có quyền đọc thư.

## 2. Tạo Cloud Firestore và bật Rules riêng tư

Vào **Build → Firestore Database**, tạo database nếu chưa có.

Trong **Firestore Database → Rules**:

1. Mở file [firestore.rules](./firestore.rules) của repository.
2. Thay `REPLACE_WITH_RECIPIENT_FIREBASE_AUTH_UID` bằng **UID đúng của tài khoản người nhận**.
3. Nếu dự án Firestore **đã có dữ liệu/Rules cho ứng dụng khác**, **chỉ thêm block `match /fanLetters/{letterId}` vào các Rules hiện tại**. Đừng ghi đè toàn bộ Rules của ứng dụng khác.
4. Nhấn **Publish** sau khi đọc và kiểm tra kỹ.

**Ý nghĩa:**
- Fan đăng nhập ẩn danh chỉ được **CREATE** thư mới (không được list/get/update/delete).
- Tài khoản người nhận có **UID chính xác** mới được **GET/LIST** tất cả thư.
- **Mật khẩu trang `2705520` chỉ là khóa giao diện**; không quyết định quyền đọc Firebase. Dù ai biết mã này thì vẫn không thể đọc thư nếu không đăng nhập đúng tài khoản và không được Rules cấp quyền.
- Người quản trị Firebase, dựa trên quyền truy cập quản lý dự án, vẫn có thể quản trị nội dung. Đây không phải mã hóa đầu-cuối.

Cần kiểm thử Rules trước khi chia sẻ trang: người ẩn danh tạo được thư nhưng không đọc/list được; tài khoản khác đăng nhập cũng bị từ chối; chỉ đúng UID mới xem được thư.

## 3. Lấy cấu hình Firebase Web App

Vào **Project Settings → General → Your apps**. Nếu chưa có web app, nhấn biểu tượng web `</>` và tạo một app.

Chỉ lấy hai thông số của cấu hình client:
- **Web API key** (`apiKey`)
- **Project ID** (`projectId`)

**Không đưa service account JSON, private key hay mật khẩu vào Vite env**. API key của Firebase Web App vốn sẽ nằm trong JavaScript phía trình duyệt, nên bảo mật phải dựa trên **Rules**.

### Dùng GitHub Pages

Repository → **Settings → Secrets and variables → Actions → New repository secret**:

- `VITE_FIREBASE_API_KEY` = apiKey của Web App.
- `VITE_FIREBASE_PROJECT_ID` = projectId.

Workflow `.github/workflows/deploy.yml` đã được điều chỉnh để truyền hai giá trị trên khi build.

Sau khi điền secrets, vào tab **Actions → Deploy Vite site to Pages → Run workflow** để build lại.

### Dùng máy local

Tạo `.env.local` từ `.env.example`, điền hai giá trị, sau đó chạy `npm run dev`.
`.env.local` không được commit lên GitHub.

## 4. Kiểm thử 4 tình huống

1. **Fan thường**: mở web không cần nhập mật khẩu; viết thư, gửi; chỉ khi server xác nhận ghi dữ liệu thành công mới thấy phong bì gấp và niêm phong.
2. **Fan khác**: không có danh sách, không có nút mở thư và không thể tải nội dung bằng Firestore REST.
3. **Người nhận**: nhập `2705520` ở lá thư chính, đi tới hộp thư nhỏ, đăng nhập email/mật khẩu Firebase được cấp quyền; những phong thư mới hiển thị để lần lượt mở đọc.
4. **Niêm phong lại**: bấm đóng thư chính hoặc đăng xuất sẽ ẩn mọi nội dung riêng trong giao diện, xóa phiên đăng nhập khỏi bộ nhớ của trang (không lưu mật khẩu).

## 5. Lưu ý vận hành và chống spam

Do fan gửi bằng tài khoản ẩn danh, một người có thể gửi nhiều lần nếu cố ý. Trước khi chia sẻ rộng, cân nhắc **Firebase App Check, rate limit, cơ chế báo cáo/duyệt và giới hạn sử dụng**. Không dùng Rules kiểu `allow read: if true` hay `allow read: if request.auth != null` cho collection `fanLetters`; cả hai sẽ khiến nội dung bị lộ.

Nếu muốn chỉ cần một mã số mà vẫn giữ thư thực sự riêng tư, bạn cần **xác thực mật khẩu phía máy chủ, giới hạn số lần thử và cấp phiên truy cập an toàn** (ví dụ Cloud Functions + Firebase Auth custom token). Mã số nằm trong code GitHub Pages không thể thay cho xác thực người nhận.

Dữ liệu cũ trong bình luận GitHub không được tự động nhập vào Firebase. Trang GitHub Issues công khai trước đây đã được khóa và đóng, không còn là nơi nhận thư.
