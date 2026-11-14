import type { Locale } from "../types";

export interface SiteCopy {
  controls: {
    languageLabel: string;
    switchLanguage: string;
    vietnamese: string;
    chinese: string;
    themeLabel: string;
    switchToLight: string;
    switchToDark: string;
  };
  music: {
    title: string;
    unavailable: string;
    error: string;
    play: string;
    pause: string;
    mute: string;
    unmute: string;
    volume: string;
    progress: string;
    addMusicHint: string;
    errorHint: string;
  };
  intro: {
    eyebrow: string;
    title: string;
    description: string;
    enter: string;
    enterAria: string;
    specialDay: string;
    birthdayHeadline: string;
    dearSubheading: string;
  };
  hero: {
    eyebrow: string;
    titleSuffix: string;
    description: string;
    countdownLabel: string;
    birthdayToday: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    explore: string;
    exploreAria: string;
    titleLineOne: string;
    titleLineTwo: string;
    editorialBody: string;
    chineseAccent: string;
    warmWords: string[];
  };
  gallery: {
    eyebrow: string;
    title: string;
    description: string;
    openImage: string;
    openImageAria: string;
    closeLightbox: string;
    previous: string;
    next: string;
    imageCount: string;
    playVideo: string;
    videoUnavailable: string;
  };
  letter: {
    eyebrow: string;
    title: string;
    description: string;
    sealed: string;
    open: string;
    openAria: string;
    close: string;
    signature: string;
    envelopeTo: string;
    envelopeFrom: string;
  };
  cake: {
    eyebrow: string;
    title: string;
    description: string;
    wishPrompt: string;
    lightCandles: string;
    blowCandles: string;
    celebration: string;
    reset: string;
  };
  wishes: {
    eyebrow: string;
    title: string;
    description: string;
    inputLabel: string;
    inputPlaceholder: string;
    submit: string;
    success: string;
    empty: string;
    limit: string;
    wallLabel: string;
  };
  finale: {
    eyebrow: string;
    title: string;
    description: string;
    replay: string;
    backToTop: string;
    chineseTitle: string;
  };
  footer: {
    madeWithLove: string;
    dedication: string;
  };
  a11y: {
    openMenu: string;
    close: string;
    decorativeImage: string;
    musicOn: string;
    musicOff: string;
    loading: string;
    skipToContent: string;
  };
}

export const copy: Record<Locale, SiteCopy> = {
  vi: {
    controls: {
      languageLabel: "Ngôn ngữ",
      switchLanguage: "Chuyển sang tiếng Trung",
      vietnamese: "Tiếng Việt",
      chinese: "中文",
      themeLabel: "Giao diện",
      switchToLight: "Chuyển sang giao diện sáng",
      switchToDark: "Chuyển sang giao diện tối"
    },
    music: {
      title: "Nhạc nền",
      unavailable: "Nhạc chưa được thêm",
      error: "Không thể phát tệp nhạc",
      play: "Phát nhạc nền",
      pause: "Tạm dừng nhạc nền",
      mute: "Tắt tiếng nhạc nền",
      unmute: "Bật tiếng nhạc nền",
      volume: "Âm lượng nhạc nền",
      progress: "Tiến trình bài nhạc",
      addMusicHint: "Thêm MP3 vào public/music/ để bật nhạc.",
      errorHint: "Kiểm tra tên tệp và đường dẫn nhạc trong cấu hình."
    },
    intro: {
      eyebrow: "SUNSHINE FOR GUOLIN",
      title: "Trịnh lão sư · 郑老师",
      description: "Một món quà nhỏ gửi đến Trịnh lão sư, bằng tất cả yêu thương.",
      enter: "Mở món quà dành cho thầy ✨",
      enterAria: "Mở món quà sinh nhật dành cho Trịnh lão sư",
      specialDay: "MỘT NGÀY ĐẶC BIỆT DÀNH CHO TRỊNH LÃO SƯ",
      birthdayHeadline: "HAPPY BIRTHDAY",
      dearSubheading: "Mong tuổi mới của Trịnh lão sư thật nhiều sức khỏe, bình an và những niềm vui giản dị. Mong mỗi ngày đều có điều khiến thầy mỉm cười."
    },
    hero: {
      eyebrow: "CHÚC MỪNG SINH NHẬT",
      titleSuffix: "- Hiểu Hiểu",
      description: "Chúc một tuổi mới rực rỡ, an yên và đầy ắp niềm vui.",
      countdownLabel: "Đếm ngược đến ngày sinh nhật",
      birthdayToday: "Hôm nay là ngày thật đặc biệt!",
      days: "Ngày",
      hours: "Giờ",
      minutes: "Phút",
      seconds: "Giây",
      explore: "Cùng chúc mừng",
      exploreAria: "Cuộn đến những khoảnh khắc sinh nhật",
      titleLineOne: "ANOTHER YEAR,",
      titleLineTwo: "STILL OUR SUNSHINE.",
      editorialBody: "A LITTLE SUNSHINE, A LOT OF LOVE. Một chút ánh nắng, thật nhiều yêu thương — dành cho nụ cười luôn làm mọi khoảnh khắc trở nên ấm áp hơn.",
      chineseAccent: "生日快乐",
      warmWords: ["Ấm áp", "Niềm vui", "Kỷ niệm", "Mãi mãi"]
    },
    gallery: {
      eyebrow: "NHỮNG KHOẢNH KHẮC ÁNH VÀNG",
      title: "Những khoảnh khắc đáng giữ gìn",
      description: "Những lát cắt nhỏ của niềm vui, được cất giữ bằng cả trái tim.",
      openImage: "Xem ảnh",
      openImageAria: "Mở ảnh ở chế độ toàn màn hình",
      closeLightbox: "Đóng trình xem ảnh",
      previous: "Ảnh trước",
      next: "Ảnh tiếp theo",
      imageCount: "Ảnh {current} trên {total}",
      playVideo: "Xem video kỷ niệm",
      videoUnavailable: "Video kỷ niệm sẽ sớm được thêm vào."
    },
    letter: {
      eyebrow: "GỬI TRỌN YÊU THƯƠNG",
      title: "Một lá thư dành cho anh",
      description: "Có một điều dịu dàng đang được cất trong phong thư này.",
      sealed: "Một lá thư đang chờ được mở",
      open: "Mở thư",
      openAria: "Mở lá thư sinh nhật",
      close: "Khép thư",
      signature: "— Với tất cả yêu thương",
      envelopeTo: "GỬI ĐẾN 郑国霖",
      envelopeFrom: "VỚI TẤT CẢ YÊU THƯƠNG"
    },
    cake: {
      eyebrow: "ĐIỀU ƯỚC DƯỚI ÁNH NẾN",
      title: "Hãy ước một điều thật đẹp",
      description: "Chạm vào chiếc bánh, nhắm mắt lại, và gửi một điều ước vào năm mới.",
      wishPrompt: "Điều ước của anh là gì?",
      lightCandles: "Thắp nến",
      blowCandles: "Thổi nến",
      celebration: "Điều ước đã được gửi vào những vì sao!",
      reset: "Ước thêm một lần nữa"
    },
    wishes: {
      eyebrow: "LỜI CHÚC TỪ TRÁI TIM",
      title: "Gửi một điều ước cho Quốc Lâm",
      description: "Để lại vài lời ấm áp và cùng làm ngày hôm nay rực rỡ hơn.",
      inputLabel: "Lời chúc của bạn",
      inputPlaceholder: "Viết lời chúc sinh nhật của bạn tại đây...",
      submit: "Gửi lời chúc",
      success: "Lời chúc của bạn đã được gửi bằng tất cả yêu thương.",
      empty: "Hãy viết một lời chúc trước khi gửi nhé.",
      limit: "Tối đa {max} ký tự",
      wallLabel: "Bức tường lời chúc"
    },
    finale: {
      eyebrow: "MỘT NĂM MỚI RỰC RỠ",
      title: "TO OUR FOREVER SUNSHINE",
      description: "Mong cuộc đời luôn dịu dàng với anh như cách nụ cười của anh đã dịu dàng với chúng em.",
      replay: "CHÚC MỪNG THÊM LẦN NỮA 🎉",
      backToTop: "Trở về đầu trang",
      chineseTitle: "郑国霖，生日快乐！"
    },
    footer: {
      madeWithLove: "Được làm bằng yêu thương bởi Thao Giang",
      dedication: "Dành tặng Trịnh Quốc Lâm"
    },
    a11y: {
      openMenu: "Mở điều hướng",
      close: "Đóng",
      decorativeImage: "Hình ảnh trang trí",
      musicOn: "Bật nhạc nền",
      musicOff: "Tắt nhạc nền",
      loading: "Đang tải",
      skipToContent: "Bỏ qua để đến nội dung chính"
    }
  },
  zh: {
    controls: {
      languageLabel: "语言",
      switchLanguage: "切换至越南语",
      vietnamese: "Tiếng Việt",
      chinese: "中文",
      themeLabel: "主题",
      switchToLight: "切换至浅色模式",
      switchToDark: "切换至深色模式"
    },
    music: {
      title: "背景音乐",
      unavailable: "音乐尚未添加",
      error: "无法播放音乐文件",
      play: "播放背景音乐",
      pause: "暂停背景音乐",
      mute: "静音背景音乐",
      unmute: "取消静音背景音乐",
      volume: "背景音乐音量",
      progress: "音乐进度",
      addMusicHint: "将 MP3 添加到 public/music/ 后即可启用。",
      errorHint: "请检查音乐文件名和配置路径。"
    },
    intro: {
      eyebrow: "SUNSHINE FOR GUOLIN",
      title: "郑老师",
      description: "满载心意，送给郑老师的一份小小生日礼物。",
      enter: "开启这份生日惊喜 ✨",
      enterAria: "打开献给郑老师的生日礼物",
      specialDay: "把今天的美好，都送给郑老师",
      birthdayHeadline: "HAPPY BIRTHDAY",
      dearSubheading: "愿郑老师新的一岁平安健康，常有欢喜，所遇皆温柔。愿每一天都有值得微笑的小美好。"
    },
    hero: {
      eyebrow: "生日快乐",
      titleSuffix: "- 晓晓",
      description: "愿新的一岁璀璨、从容，装满欢喜。",
      countdownLabel: "距离生日还有",
      birthdayToday: "今天是特别的一天！",
      days: "天",
      hours: "小时",
      minutes: "分钟",
      seconds: "秒",
      explore: "一起庆祝",
      exploreAria: "滚动查看生日瞬间",
      titleLineOne: "ANOTHER YEAR,",
      titleLineTwo: "STILL OUR SUNSHINE.",
      editorialBody: "A LITTLE SUNSHINE, A LOT OF LOVE. 一点阳光，很多很多爱——献给那个总能让每个瞬间变得温暖的人。",
      chineseAccent: "生日快乐",
      warmWords: ["温暖", "快乐", "回忆", "永远"]
    },
    gallery: {
      eyebrow: "鎏金瞬间",
      title: "值得珍藏的时刻",
      description: "把每一帧小小的欢喜，都珍藏在心里。",
      openImage: "查看照片",
      openImageAria: "全屏打开照片",
      closeLightbox: "关闭图片查看器",
      previous: "上一张",
      next: "下一张",
      imageCount: "第 {current} 张，共 {total} 张",
      playVideo: "播放纪念视频",
      videoUnavailable: "纪念视频即将添加。"
    },
    letter: {
      eyebrow: "满怀爱意",
      title: "写给你的一封信",
      description: "这封信里，藏着一份温柔的心意。",
      sealed: "一封等待开启的信",
      open: "开启信笺",
      openAria: "打开生日信",
      close: "合上信笺",
      signature: "— 满怀爱意",
      envelopeTo: "TO 郑国霖",
      envelopeFrom: "WITH ALL OUR LOVE"
    },
    cake: {
      eyebrow: "烛光下的心愿",
      title: "许下一个美好的愿望",
      description: "轻触蛋糕，闭上眼睛，把心愿送往新的一岁。",
      wishPrompt: "你的心愿是什么？",
      lightCandles: "点亮蜡烛",
      blowCandles: "吹灭蜡烛",
      celebration: "心愿已经送往星光之中！",
      reset: "再许一个愿望"
    },
    wishes: {
      eyebrow: "来自心底的祝福",
      title: "送给国霖一份祝福",
      description: "留下几句温暖的话，让今天更加闪耀。",
      inputLabel: "你的祝福",
      inputPlaceholder: "在这里写下你的生日祝福...",
      submit: "送出祝福",
      success: "你的祝福已带着满满爱意送出。",
      empty: "请先写下一句祝福再发送。",
      limit: "最多 {max} 个字符",
      wallLabel: "祝福墙"
    },
    finale: {
      eyebrow: "璀璨的新一年",
      title: "TO OUR FOREVER SUNSHINE",
      description: "愿生活待你永远如你的笑容待我们一般温柔。",
      replay: "再次庆祝 🎉",
      backToTop: "回到页面顶部",
      chineseTitle: "郑国霖，生日快乐！"
    },
    footer: {
      madeWithLove: "由 Thao Giang 用爱制作",
      dedication: "献给郑国霖"
    },
    a11y: {
      openMenu: "打开导航",
      close: "关闭",
      decorativeImage: "装饰图片",
      musicOn: "打开背景音乐",
      musicOff: "关闭背景音乐",
      loading: "加载中",
      skipToContent: "跳至主要内容"
    }
  }
};
