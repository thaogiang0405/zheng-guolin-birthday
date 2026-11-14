import type { LocalizedText } from "../types";

/**
 * The five roles selected for the birthday tribute.
 * Images are intentionally replaceable: swap photo.src with the matching
 * locally uploaded asset("images/films/your-file.jpg") in a later edit.
 * A missing photo creates a decorative, clearly labelled placeholder.
 */
export interface FilmPhoto {
  id: string;
  src?: string;
  alt: LocalizedText;
}

export interface FeaturedFilm {
  id: string;
  year: number;
  title: LocalizedText;
  character: LocalizedText;
  description: LocalizedText;
  highlight: string;
  photos: [FilmPhoto, FilmPhoto];
  referenceUrl: string;
}

const local = (vi: string, zh: string): LocalizedText => ({ vi, zh });
const slot = (id: string, vi: string, zh: string, src?: string): FilmPhoto => ({
  id,
  src,
  alt: local(vi, zh),
});

export const featuredFilms: FeaturedFilm[] = [
  {
    id: "sui-tang-2003",
    year: 2003,
    title: local("Tùy Đường Anh Hùng Truyện", "隋唐英雄传"),
    character: local("Lý Thế Dân", "李世民"),
    description: local(
      "Từ chàng thiếu niên mang chí lớn đến một bậc quân vương, đó là hình ảnh vẫn còn được nhớ mãi.",
      "从胸怀壮志的少年到气度不凡的君王，这个李世民令人久久难忘。",
    ),
    highlight: "01",
    photos: [
      slot("sui-tang-portrait", "Trịnh Quốc Lâm trong vai Lý Thế Dân, Tùy Đường Anh Hùng Truyện (2003)", "郑国霖饰演李世民，《隋唐英雄传》(2003)"),
      slot("sui-tang-scene", "Chỗ đặt ảnh phân cảnh Lý Thế Dân (2003)", "李世民（2003）剧情照片待补"),
    ],
    referenceUrl: "https://ent.sina.com.cn/v/2004-08-05/1050464726.html",
  },
  {
    id: "seven-fairies-2005",
    year: 2005,
    title: local("Hoan Thiên Hỉ Địa Thất Tiên Nữ", "欢天喜地七仙女"),
    character: local("Đổng Vĩnh", "董永"),
    description: local(
      "Sự chân thành và dịu dàng của Đổng Vĩnh đã trở thành một phần ký ức tuổi thơ thật đẹp.",
      "董永的真诚与温柔，成为许多人记忆中美好的一页。",
    ),
    highlight: "02",
    photos: [
      slot("seven-fairies-portrait", "Chỗ đặt chân dung Đổng Vĩnh (2005)", "董永（2005）角色肖像待补"),
      slot("seven-fairies-scene", "Chỗ đặt phân cảnh Đổng Vĩnh và Thất Tiên Nữ (2005)", "董永与七仙女（2005）剧情照片待补"),
    ],
    referenceUrl: "https://ent.sina.com.cn/v/2004-08-18/1743477603.html",
  },
  {
    id: "condor-2014",
    year: 2014,
    title: local("Thần Điêu Đại Hiệp", "神雕侠侣"),
    character: local("Quách Tĩnh", "郭靖"),
    description: local(
      "Giữa thế giới kiếm hiệp, hình ảnh Quách Tĩnh cương trực và nghĩa khí mang một sức hút rất riêng.",
      "在刀光剑影的江湖里，正直重义的郭靖有着独特的魅力。",
    ),
    highlight: "03",
    photos: [
      slot("condor-portrait", "Trịnh Quốc Lâm trong vai Quách Tĩnh, Thần Điêu Đại Hiệp (2014)", "郑国霖饰演郭靖，《神雕侠侣》(2014)", "https://k.sinaimg.cn/n/sinacn20200203ac/116/w550h366/20200203/6ba9-inzcrxr8310355.jpg/w700d1q75cms.jpg"),
      slot("condor-scene", "Chỗ đặt ảnh phân cảnh Quách Tĩnh (2014)", "郭靖（2014）剧情照片待补"),
    ],
    referenceUrl: "https://ent.sina.com.cn/v/m/2014-12-05/doc-icesifvx0377459.shtml",
  },
  {
    id: "chongzi-2023",
    year: 2023,
    title: local("Trọng Tử", "重紫"),
    character: local("Trác Diệu · Cung chủ Thanh Hoa Cung", "卓耀 · 青华宫宫主"),
    description: local(
      "Trác Diệu để lại dấu ấn bởi khí chất uy nghiêm, cùng những tình cảm sâu sắc phía sau dáng vẻ ấy.",
      "卓耀的威严气度之下，也藏着令人动容的深情。",
    ),
    highlight: "04",
    photos: [
      slot("chongzi-portrait", "Ảnh tạo hình Trịnh Quốc Lâm vai Trác Diệu trong Trọng Tử (2023)", "郑国霖饰演卓耀，《重紫》(2023)定妆照", "https://k.sinaimg.cn/n/sinakd20210830ac/301/w484h617/20210830/3101-0c2cc34df3108f86f131c81ae9d93c1c.jpg/w700d1q75cms.jpg"),
      slot("chongzi-scene", "Chỗ đặt ảnh phân cảnh Trác Diệu trong Trọng Tử (2023)", "《重紫》卓耀（2023）剧情照片待补"),
    ],
    referenceUrl: "https://bkso.baidu.com/item/%E9%87%8D%E7%B4%AB/18814284",
  },
  {
    id: "moon-2023",
    year: 2023,
    title: local("Trường Nguyệt Tẫn Minh", "长月烬明"),
    character: local("Cù Huyền Tử", "衢玄子"),
    description: local(
      "Mái tóc bạc và phong thái điềm tĩnh tạo nên một vị chưởng môn đầy tiên khí, khiến người xem lưu luyến.",
      "一袭白发，气度沉静，衢玄子的仙风道骨令人过目难忘。",
    ),
    highlight: "05",
    photos: [
      slot("moon-portrait", "Trịnh Quốc Lâm vai Cù Huyền Tử trong Trường Nguyệt Tẫn Minh (2023)", "郑国霖饰演衢玄子，《长月烬明》(2023)", "https://p1-tt.byteimg.com/origin/tos-cn-i-qvj2lq49k0/882b029b74cb4641a76e52ae44fe5a62.jpg"),
      slot("moon-scene", "Phân cảnh Cù Huyền Tử trong Trường Nguyệt Tẫn Minh (2023)", "《长月烬明》衢玄子剧情照（2023）", "https://p0.itc.cn/images01/20230511/c6ea8236688c43e5a44a17e7f330a413.jpeg"),
    ],
    referenceUrl: "https://wapbaike.baidu.com/item/%E9%95%BF%E6%9C%88%E7%83%AC%E6%98%8E/59071327",
  },
];
