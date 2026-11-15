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
    musicTitle: string;
    musicSubtitle: string;
    soundEffects: {
      gift?: string;
      letter?: string;
      candles?: string;
      finale?: string;
    };
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
    // User-provided local background music, served from public/music/.
    musicPath: asset("music/birthday-melody.mp3"),
    musicTitle: "Sunshine for Guolin",
    musicSubtitle: "birthday-melody.mp3",
    // Add only user-provided or licensed local sound files, for example: asset("music/gift-open.mp3").
    soundEffects: {
      gift: undefined,
      letter: undefined,
      candles: undefined,
      finale: undefined
    },
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
        "Gửi Trịnh lão sư thương mến,",
        "Có lẽ thầy sẽ chẳng bao giờ biết được rằng, ở một nơi nào đó, có những người vẫn luôn dõi theo thầy bằng tất cả sự yêu mến và trân trọng. Từ những năm tháng trên màn ảnh, qua từng nhân vật, từng ánh mắt và nụ cười, thầy đã vô tình trở thành một phần ký ức thật đẹp trong lòng chúng em.",
        "Thời gian trôi qua, những vai diễn rồi cũng khép lại, nhưng tình cảm dành cho thầy thì vẫn còn nguyên vẹn. Thật vui khi hôm nay vẫn được nhìn thấy thầy, được bắt gặp những nụ cười gần gũi và những khoảnh khắc giản dị. Dù ở đâu, dù đang làm gì, Trịnh lão sư vẫn luôn có một sức hút rất riêng mà chúng em vô cùng yêu quý.",
        "Nhân ngày sinh nhật, chúng em không mong điều gì quá lớn lao, chỉ mong thầy luôn mạnh khỏe, bình an và hạnh phúc. Mong những tháng ngày phía trước sẽ thật dịu dàng, để thầy được làm những điều mình thích, gặp những người chân thành và có thật nhiều lý do để mỉm cười.",
        "晓晓，生日快乐！",
        "Mong tuổi mới của thầy có thật nhiều niềm vui, và mỗi ngày đều trôi qua theo cách mà thầy mong muốn.",
        "— Gửi đến thầy, bằng tất cả yêu thương. ♡"
      ],
      zh: [
        "亲爱的郑老师：",
        "也许您永远不会知道，在世界的某个角落，一直有人怀着满满的喜欢与珍惜，默默关注着您。从那些荧幕上的岁月开始，一个个角色、一个个眼神、一抹抹微笑，都悄悄成为了我们心中珍贵而美好的回忆。",
        "时光慢慢向前，故事终会落幕，但对您的喜爱却始终如初。如今，还能看到您的笑容，看到那些亲切而真实的日常瞬间，真的让人觉得很幸福。无论身在何处，无论以怎样的方式与大家相遇，郑老师始终有着独一无二的魅力。",
        "在这个特别的日子里，我们只希望您身体健康，平安喜乐，幸福常伴。愿往后的日子里，您能做自己喜欢的事，遇见真诚善良的人，每一天都有值得微笑的小美好。",
        "晓晓，生日快乐！",
        "愿新的一岁有更多欢喜，也愿每一天都能如您所愿，自在而美好。",
        "— 满怀爱意，献给您。♡"
      ]
    }
  },
  wishes: {
    maxLength: 500,
    maxVisible: 12
  }
};
