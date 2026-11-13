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
- Nút nhạc chỉ xuất hiện khi được cấu hình file âm thanh hợp lệ; không tự phát nhạc và không có URL âm thanh bị hỏng.

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

## Thêm nhạc nền tùy chọn

Website không đính kèm nhạc thương mại và không tự phát nhạc. Để bật trình điều khiển nhạc:

1. Thêm một file âm thanh có quyền sử dụng, ví dụ `public/media/birthday-melody.mp3`.
2. Trong `src/data/birthdayConfig.ts`, đổi:

```ts
musicPath: undefined
```

thành:

```ts
musicPath: asset("media/birthday-melody.mp3")
```

Nút play/pause/mute sẽ tự xuất hiện. Âm thanh chỉ bắt đầu khi người xem bấm nút.

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
