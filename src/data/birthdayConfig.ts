import type { GalleryItem, Locale, LocalizedText } from "../types";

declare global {
  interface ImportMetaEnv {
    readonly BASE_URL: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

/** Builds an asset URL that works both locally and when the app is deployed under a subpath. */
export const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

const localized = (vi: string, zh: string): LocalizedText => ({ vi, zh });

export interface BirthdayConfig {
  defaultLocale: Locale;
  person: {
    names: LocalizedText;
    latinName: string;
    nickname: LocalizedText;
    birthday?: {
      month: number;
      day: number;
      timeZone: string;
    };
  };
  media: {
    invitationImage: string;
    heroImage: string;
    finaleImage: string;
    gallery: GalleryItem[];
    musicPath: string | undefined;
    videoPath: string | undefined;
  };
  letter: {
    /** Intentionally English and editable; replace this with a personal message before sharing. */
    defaultEnglish: {
      greeting: string;
      paragraphs: string[];
      signature: string;
    };
    localized: Record<Locale, string[]>;
  };
  wishes: {
    maxLength: number;
    maxVisible: number;
  };
}

export const birthdayConfig: BirthdayConfig = {
  defaultLocale: "vi",
  person: {
    names: localized("Trịnh Quốc Lâm", "郑国霖"),
    latinName: "Zheng Guolin",
    nickname: localized("Hiểu Hiểu", "晓晓"),
    // Intentionally left unset until a verified date is supplied by the site owner.
    birthday: undefined
  },
  media: {
    invitationImage: asset("images/moment-cake.jpg"),
    heroImage: asset("images/hero-cake.jpg"),
    finaleImage: asset("images/final-balloons.jpg"),
    gallery: [
      {
        id: "cake",
        src: asset("images/moment-cake.jpg"),
        alt: localized(
          "Trịnh Quốc Lâm bên chiếc bánh sinh nhật và chiếc mũ tiệc màu xanh.",
          "郑国霖戴着蓝色生日帽，坐在生日蛋糕旁。"
        ),
        caption: localized(
          "Một điều ước, một nụ cười, một khởi đầu ngọt ngào.",
          "一个心愿，一个微笑，一个甜蜜的开始。"
        ),
        rotation: "-1.8deg",
        featured: true
      },
      {
        id: "balloons",
        src: asset("images/moment-balloons.jpg"),
        alt: localized(
          "Trịnh Quốc Lâm ngồi giữa những quả bóng bay vàng trong ngày sinh nhật.",
          "郑国霖在生日当天与金色气球合影。"
        ),
        caption: localized(
          "Những khoảnh khắc lấp lánh đáng được giữ thật gần.",
          "闪闪发光的瞬间，值得珍藏在心。"
        ),
        rotation: "1.3deg"
      },
      {
        id: "hero-cake",
        src: asset("images/hero-cake.jpg"),
        alt: localized(
          "Trịnh Quốc Lâm cầm bánh kem sinh nhật.",
          "郑国霖手捧生日蛋糕。"
        ),
        caption: localized(
          "Ngày hôm nay, mọi điều tốt đẹp đều thuộc về anh.",
          "今天，所有美好都属于你。"
        ),
        rotation: "0.4deg"
      },
      {
        id: "final-balloons",
        src: asset("images/final-balloons.jpg"),
        alt: localized(
          "Trịnh Quốc Lâm cùng những quả bóng bay vàng trong không gian chúc mừng sinh nhật.",
          "郑国霖与金色气球一同庆祝生日。"
        ),
        caption: localized(
          "Khép lại bằng ánh vàng, mở ra bằng hy vọng.",
          "以金色收尾，以希望启程。"
        ),
        rotation: "-1.1deg"
      }
    ],
    // Add optional local files later, for example: asset("media/birthday-song.mp3").
    musicPath: undefined,
    videoPath: undefined
  },
  letter: {
    defaultEnglish: {
      greeting: "Dear Guolin,",
      paragraphs: [
        "Happy Birthday!",
        "Thank you for all the wonderful characters, unforgettable moments and warm smiles you have shared with us.",
        "May this new chapter of your life be filled with good health, peaceful days, beautiful memories and countless reasons to smile.",
        "You don't have to shine brighter than anyone else.",
        "Just keep being the wonderful person you are.",
        "生日快乐，郑国霖！"
      ],
      signature: "With love, from someone who will always cheer for you."
    },
    localized: {
      vi: [
        "Quốc Lâm thân mến,",
        "Chúc mừng sinh nhật!",
        "Cảm ơn anh vì tất cả những vai diễn tuyệt vời, những khoảnh khắc khó quên và những nụ cười ấm áp đã sẻ chia cùng chúng em.",
        "Mong chương mới của cuộc đời anh có thật nhiều sức khỏe, những ngày bình yên, ký ức đẹp và vô vàn lý do để mỉm cười.",
        "Anh không cần tỏa sáng hơn bất kỳ ai.",
        "Chỉ cần tiếp tục là con người tuyệt vời mà anh vốn có.",
        "生日快乐，郑国霖！",
        "Thân mến, từ một người sẽ luôn cổ vũ cho anh."
      ],
      zh: [
        "亲爱的国霖：",
        "生日快乐！",
        "感谢你为我们带来这么多精彩角色、难忘瞬间和温暖笑容。",
        "愿你人生的新篇章里，充满健康、宁静的日子、美好的回忆和无数微笑的理由。",
        "你不必比任何人更加耀眼。",
        "只要继续做那个本就无比美好的自己。",
        "生日快乐，郑国霖！",
        "满怀爱意，来自一个永远为你加油的人。"
      ]
    }
  },
  wishes: {
    maxLength: 180,
    maxVisible: 12
  }
};
