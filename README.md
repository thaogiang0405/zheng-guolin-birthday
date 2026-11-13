# SUNSHINE FOR GUOLIN

Microsite sinh nhật tương tác dành tặng Trịnh Quốc Lâm (郑国霖), xây dựng với React, TypeScript, Vite, Tailwind CSS, Framer Motion, GSAP và Canvas Confetti.

## Tính năng

- Trải nghiệm mở quà sinh nhật với hiệu ứng confetti chỉ sau thao tác của người dùng.
- Bố cục editorial 7 chương: lời mời, hero, gallery, thư tay, bánh sinh nhật, wish wall và finale.
- Chuyển đổi tiếng Việt / tiếng Trung và giao diện sáng / tối.
- Gallery polaroid có lightbox, thao tác vuốt trên thiết bị cảm ứng, điều hướng bàn phím và hỗ trợ Escape.
- Phong thư mở tương tác, bánh sinh nhật thổi nến, khói và confetti.
- Wish wall lưu lời chúc **trên localStorage của trình duyệt hiện tại**; không có backend và không chia sẻ công khai.
- Tôn trọng `prefers-reduced-motion`, có focus state, semantic landmark và responsive từ 320px.
- Music player glassmorphism với đĩa vinyl, play/pause, mute, volume, seek/progress và trạng thái trống an toàn khi chưa có MP3.
- Nhạc chỉ được yêu cầu phát sau thao tác **Mở món quà sinh nhật**; hiệu ứng âm thanh tùy chọn sẽ tự hạ âm lượng nhạc nền rồi khôi phục.

## Yêu cầu

- Node.js 20 trở lên (khuyến nghị Node 22+)
- npm 10 trở lên

## Chạy cục bộ

```bash
npm install
npm run dev
```

Mở địa chỉ Vite in ra trong terminal, thường là `http://localhost:5173`.

## Build production

```bash
npm run build
```

Thư mục build là `dist/`. Kiểm tra bản production tại máy bằng:

```bash
npm run preview
```

## Chỉnh nội dung

Tất cả dữ liệu chính nằm trong [src/data/birthdayConfig.ts](src/data/birthdayConfig.ts):

- Tên tiếng Việt / tiếng Trung.
- Ảnh hero, gallery, finale.
- Thư sinh nhật có thể chỉnh sửa.
- Đường dẫn nhạc/video tùy chọn.
- Số ký tự tối đa và số wish hiển thị.

Nội dung giao diện song ngữ nằm trong [src/data/copy.ts](src/data/copy.ts). Không cần thay đổi logic component để chỉnh chữ.

> Trường `birthday` đang để trống có chủ đích. Chỉ thêm ngày sinh sau khi đã xác minh.

## Thay ảnh

Ảnh hiện tại nằm trong `public/images/`:

```txt
public/images/
  hero-cake.jpg
  moment-cake.jpg
  moment-balloons.jpg
  final-balloons.jpg
```

Để thay ảnh:

1. Chép ảnh mới vào `public/images/`.
2. Cập nhật đường dẫn trong `src/data/birthdayConfig.ts` bằng helper `asset()`.
3. Cập nhật `alt` và `caption` tiếng Việt / tiếng Trung cho ảnh gallery.
4. Khuyến nghị ảnh chân dung tỷ lệ 2:3, tối thiểu 1080 × 1620 px.

Ví dụ:

```ts
heroImage: asset("images/hero-moi.jpg")
```

## Thêm nhạc nền và hiệu ứng âm thanh tùy chọn

Website không đính kèm nhạc thương mại, không tự phát nhạc lúc tải trang và không dùng URL âm thanh bên ngoài. Khi chưa có MP3, player vẫn hiển thị trạng thái sẵn sàng thay vì tạo lỗi phát nhạc.

1. Chỉ dùng file do bạn sở hữu hoặc được cấp phép sử dụng.
2. Thêm MP3 vào `public/music/`, ví dụ:

```txt
public/music/
  birthday-melody.mp3
  gift-open.mp3
  letter-open.mp3
  candles.mp3
  finale.mp3
```

3. Trong `src/data/birthdayConfig.ts`, đổi:

```ts
musicPath: undefined
```

thành:

```ts
musicPath: asset("music/birthday-melody.mp3")
```

4. Muốn thêm âm thanh nhỏ cho các tương tác, cấu hình các đường dẫn sau:

```ts
soundEffects: {
  gift: asset("music/gift-open.mp3"),
  letter: asset("music/letter-open.mp3"),
  candles: asset("music/candles.mp3"),
  finale: asset("music/finale.mp3")
}
```

Nhạc nền chỉ bắt đầu sau khi khách bấm **Mở món quà sinh nhật**. Người xem luôn có thể play/pause, mute/unmute, điều chỉnh âm lượng và tua bài nhạc. Khi một hiệu ứng âm thanh được cấu hình phát, âm lượng nhạc nền được hạ nhẹ rồi tự khôi phục.

## Deploy GitHub Pages

`vite.config.ts` đã dùng `base: "./"`, vì vậy asset path tương đối phù hợp với GitHub Pages, Netlify và Vercel.

### Cách đơn giản bằng GitHub Pages Actions

1. Đẩy source code lên một repository GitHub.
2. Vào **Settings → Pages**.
3. Ở mục **Build and deployment**, chọn **GitHub Actions**.
4. Tạo workflow `.github/workflows/deploy.yml` với nội dung sau:

```yml
name: Deploy Vite site to Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

5. Push workflow lên nhánh `main`. GitHub sẽ hiển thị URL Pages trong tab Actions hoặc Settings → Pages.

## Deploy Netlify / Vercel

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 20 trở lên

Không cần cấu hình route đặc biệt vì đây là website một trang không dùng React Router.
