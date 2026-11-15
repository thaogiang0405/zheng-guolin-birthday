# Firebase Realtime Database — lời chúc và thư bí mật

**Trịnh lão sư không cần vào Firebase, không cần email hay mật khẩu Firebase.**
Trải nghiệm mong muốn trên website: fan nhập tên + lời chúc ở cuối trang; lời chúc lưu vào Realtime Database. Thầy chỉ nhập `2705520` để mở bức thư lớn; bên trong có các phong thư nhỏ kèm tên fan, bấm vào từng phong thư để đọc.

## 1. Dự án Firebase của bạn: Realtime Database (KHÔNG PHẢI Firestore)

Mở Firebase Console → dự án **hpbd** → **Databases and storage → Realtime Database → Data**. Copy **Database URL**, ví dụ `https://hpbd-default-rtdb.asia-southeast1.firebasedatabase.app`. Đây chỉ là ví dụ định dạng, **không tự suy đoán URL thật** từ project ID.

Firebase → **Project settings → General → Your apps → loichucweb → SDK setup and configuration**: lấy `apiKey` (web client API key).

Nếu database đã có dữ liệu, hãy kiểm tra tên node đang lưu lời chúc và tên các trường. Code mẫu ở đây **mặc định dùng `fanLetters`**, trường `name` và `message`. Nếu bạn đã dùng node khác (ví dụ `loichuc`) thì phải sửa cho tương ứng; không tự di chuyển hoặc ghi đè dữ liệu cũ.

## 2. Cấp quyền gửi thư (không cần fan đăng ký)

Firebase → **Authentication → Sign-in method** → bật **Anonymous**.

Vào **Realtime Database → Rules**. File [database.rules.json](database.rules.json) chứa **mẫu chỉ cho người lạ ghi thư mới, không được đọc**. Nó không giống Cloud Firestore rules.

- Thay `REPLACE_WITH_READER_UID` bằng Firebase Authentication UID của một tài khoản *chỉ dùng trong hệ thống* để đọc thư.
- Trong dự án đã có Rules cho dữ liệu khác, **chỉ ghép rules cho node `fanLetters` vào Rules hiện tại**, không ghi đè toàn bộ.
- Không đặt `".read": true` cho `fanLetters`, kể cả khi tên và lời chúc đã ẩn trên web. Nếu public read, bất kỳ ai có URL đều có thể lấy toàn bộ nội dung qua REST.
- **Đọc thư được bảo vệ bởi Firebase Rules và cổng đọc server-side**. Mã số trong JS của trang tĩnh chỉ là một trải nghiệm mở khóa; bản production cần xác thực mã số trên server và giới hạn số lần thử.

## 3. Kết nối website GitHub Pages vào Firebase để fan gửi thư

GitHub Repository → Settings → Secrets and variables → Actions → New repository secret, đặt:

- `VITE_FIREBASE_API_KEY` = Web API key (cấu hình client công khai, không phải service-account key)
- `VITE_FIREBASE_DATABASE_URL` = Database URL ở bước 1

Workflow đã đọc hai giá trị này khi build. Sau khi điền thì chạy lại Actions → Deploy Vite site to Pages → Run workflow.

Từ lúc này fan có thể gửi thư mà không cần đăng nhập. Chỉ khi Firebase xác nhận đã ghi dữ liệu, web mới hiện phong thư gấp/niêm phong.

## 4. Cho phép thầy đọc mà không cần đăng nhập Firebase

Đây là **phần cấu hình chỉ một lần của người làm website**, không phải việc Trịnh lão sư phải làm.

Để giữ `fanLetters` riêng tư, dữ liệu cần được tải qua một máy chủ nhỏ. Dự án có mẫu [worker/letter-reader.js](worker/letter-reader.js) cho Cloudflare Worker. Cổng này nhận mã mở thư, tự xác thực bằng tài khoản Firebase riêng trên máy chủ, rồi mới lấy tên và lời chúc.

Cloudflare Worker phải được triển khai ở một tài khoản do bạn kiểm soát (có thể dùng Workers free tier tùy giới hạn hiện hành). Trong **Workers → Settings → Variables and Secrets**, thiết lập:

- `LETTER_PASSCODE` = mã 7 chữ số đã chốt, lưu **secret**
- `FIREBASE_WEB_API_KEY` = Web API key
- `FIREBASE_DATABASE_URL` = Database URL chính xác
- `FIREBASE_READER_EMAIL` và `FIREBASE_READER_PASSWORD` = tài khoản Firebase Auth Email/Password *dành riêng cho gateway*, tuyệt đối **không đưa lên GitHub hay VITE_**
- `ALLOWED_ORIGIN` = `https://thaogiang0405.github.io`

Tài khoản Firebase Email/Password này có **UID** trùng với UID được phép đọc trong `database.rules.json`. Không cần giao tài khoản đó cho Trịnh lão sư.

Sau khi Worker được triển khai, lấy URL dạng `https://<worker>.<subdomain>.workers.dev/letters` và đặt vào GitHub Actions secret:

- `VITE_LETTER_READER_API_URL` = URL đầy đủ kết thúc bằng `/letters`

Sau đó build lại trang. Khi chưa có URL này, phần thư nhỏ **hiện thông báo chưa kết nối** thay vì yêu cầu thầy đăng nhập Firebase.

**Bảo mật lưu ý:** Cổng đọc mẫu là một bước kỹ thuật. Trước khi dùng thật, cần thêm rate limit/WAF/Turnstile và **chuyển cả việc kiểm tra mật khẩu lá thư chính lên server**, vì mã 7 số hiện còn trong bundle JavaScript của website và có thể bị xem/đoán. Nếu không làm bước này, đừng khẳng định chỉ thầy mới có thể đọc thư trên thực tế. Khi cần quyền riêng tư nghiêm ngặt hơn, sử dụng tài khoản người nhận thực sự hoặc liên kết đăng nhập cá nhân.

## 5. Kiểm thử

1. Fan nhập `name` + `message`; Firebase lưu dưới `fanLetters`.
2. Gửi xong mới hiện thông báo "Phong thư đã được niêm phong".
3. Fan không thể gọi REST GET `fanLetters.json` để xem lời chúc, nếu Rules đúng.
4. Nhập `2705520` mở bức thư lớn; bên dưới nội dung có các phong thư nhỏ kèm tên và thao tác "Mở".
5. Bấm "Mở" sẽ hiển thị nội dung riêng trong phong bì; đóng thư lớn sẽ xóa trạng thái hiển thị.
6. Kiểm thử lỗi mạng, mật khẩu sai, cấu hình không hợp lệ và giới hạn gửi.

**Không chia sẻ** secret của Worker, email/mật khẩu reader, service-account JSON hay database secret qua chat hoặc code công khai.
