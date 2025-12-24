// Anime Opening Database for GTAO Battle

export interface AnimeOpening {
  id: string;
  anime: string;
  title: string;
  artist: string;
  youtubeId: string;
  season?: number;
  openingNumber?: number; // OP1, OP2, etc.
}

export const animeOpenings: AnimeOpening[] = [
  // Attack on Titan
  { id: "aot-op1", anime: "Attack on Titan", title: "Guren no Yumiya", artist: "Linked Horizon", youtubeId: "XMXgHfHxKVM", season: 1, openingNumber: 1 },
  { id: "aot-op2", anime: "Attack on Titan", title: "Jiyuu no Tsubasa", artist: "Linked Horizon", youtubeId: "PbWFpzi8C94", season: 1, openingNumber: 2 },
  { id: "aot-op3", anime: "Attack on Titan", title: "Shinzou wo Sasageyo!", artist: "Linked Horizon", youtubeId: "CID-sYQNCew", season: 2, openingNumber: 3 },
  { id: "aot-op4", anime: "Attack on Titan", title: "Red Swan", artist: "YOSHIKI feat. HYDE", youtubeId: "r4Um6okMHcE", season: 3, openingNumber: 4 },
  { id: "aot-op5", anime: "Attack on Titan", title: "Shoukei to Shikabane no Michi", artist: "Linked Horizon", youtubeId: "wFsONWnNvWY", season: 3, openingNumber: 5 },
  { id: "aot-op6", anime: "Attack on Titan", title: "My War", artist: "Shinsei Kamattechan", youtubeId: "hKHepPqtC9U", season: 4, openingNumber: 6 },
  { id: "aot-op7", anime: "Attack on Titan", title: "The Rumbling", artist: "SiM", youtubeId: "2S4qGKmzBJE", season: 4, openingNumber: 7 },

  // Death Note
  { id: "dn-op1", anime: "Death Note", title: "The WORLD", artist: "Nightmare", youtubeId: "8QE9cmfxx4s", openingNumber: 1 },
  { id: "dn-op2", anime: "Death Note", title: "What's up, people?!", artist: "Maximum the Hormone", youtubeId: "HGQAjAjsZNo", openingNumber: 2 },

  // Naruto
  { id: "naruto-op1", anime: "Naruto", title: "R★O★C★K★S", artist: "Hound Dog", youtubeId: "4t__wczfpRI", openingNumber: 1 },
  { id: "naruto-op2", anime: "Naruto", title: "Haruka Kanata", artist: "Asian Kung-Fu Generation", youtubeId: "SRn99oN1p_c", openingNumber: 2 },
  { id: "naruto-op3", anime: "Naruto", title: "Kanashimi wo Yasashisa ni", artist: "little by little", youtubeId: "F5dZfuQXOiw", openingNumber: 3 },
  { id: "naruto-op4", anime: "Naruto", title: "GO!!!", artist: "FLOW", youtubeId: "pBtvWOXYv0E", openingNumber: 4 },
  { id: "naruto-op5", anime: "Naruto", title: "Seishun Kyousoukyoku", artist: "Sambomaster", youtubeId: "2cixYBoJdso", openingNumber: 5 },

  // Naruto Shippuden
  { id: "shippuden-op1", anime: "Naruto Shippuden", title: "Hero's Come Back!!", artist: "nobodyknows+", youtubeId: "bjhpPxLNUtE", openingNumber: 1 },
  { id: "shippuden-op3", anime: "Naruto Shippuden", title: "Blue Bird", artist: "Ikimonogakari", youtubeId: "KpsJWFpLR6g", openingNumber: 3 },
  { id: "shippuden-op6", anime: "Naruto Shippuden", title: "Sign", artist: "FLOW", youtubeId: "o3ASICWeSLc", openingNumber: 6 },
  { id: "shippuden-op16", anime: "Naruto Shippuden", title: "Silhouette", artist: "KANA-BOON", youtubeId: "cXeb9cb6k0I", openingNumber: 16 },

  // One Piece
  { id: "op-op1", anime: "One Piece", title: "We Are!", artist: "Hiroshi Kitadani", youtubeId: "HRaoYuRKBaA", openingNumber: 1 },
  { id: "op-op11", anime: "One Piece", title: "Share the World", artist: "TVXQ", youtubeId: "eDG0lq3zU6c", openingNumber: 11 },
  { id: "op-op13", anime: "One Piece", title: "One Day", artist: "The Rootless", youtubeId: "WpQsHMWRJ-A", openingNumber: 13 },
  { id: "op-op20", anime: "One Piece", title: "Hope", artist: "Namie Amuro", youtubeId: "jXvpYk3ygc8", openingNumber: 20 },
  { id: "op-op23", anime: "One Piece", title: "DREAMIN' ON", artist: "Da-iCE", youtubeId: "xvNoqI77FPo", openingNumber: 23 },

  // Fullmetal Alchemist Brotherhood
  { id: "fmab-op1", anime: "Fullmetal Alchemist: Brotherhood", title: "Again", artist: "YUI", youtubeId: "2uq34TeWEdQ", openingNumber: 1 },
  { id: "fmab-op2", anime: "Fullmetal Alchemist: Brotherhood", title: "Hologram", artist: "NICO Touches the Walls", youtubeId: "okTkBvkyTqM", openingNumber: 2 },
  { id: "fmab-op3", anime: "Fullmetal Alchemist: Brotherhood", title: "Golden Time Lover", artist: "Sukima Switch", youtubeId: "kgD5R3u8YBw", openingNumber: 3 },
  { id: "fmab-op4", anime: "Fullmetal Alchemist: Brotherhood", title: "Period", artist: "CHEMISTRY", youtubeId: "9-jItCrFpug", openingNumber: 4 },
  { id: "fmab-op5", anime: "Fullmetal Alchemist: Brotherhood", title: "Rain", artist: "SID", youtubeId: "cRA5gsdCf4c", openingNumber: 5 },

  // My Hero Academia
  { id: "mha-op1", anime: "My Hero Academia", title: "The Day", artist: "Porno Graffitti", youtubeId: "yu0HjPzFYnY", openingNumber: 1 },
  { id: "mha-op2", anime: "My Hero Academia", title: "Peace Sign", artist: "Kenshi Yonezu", youtubeId: "9aJVr5tTTWk", openingNumber: 2 },
  { id: "mha-op3", anime: "My Hero Academia", title: "Sora ni Utaeba", artist: "amazarashi", youtubeId: "D7sFcwUEplE", openingNumber: 3 },
  { id: "mha-op4", anime: "My Hero Academia", title: "Odd Future", artist: "UVERworld", youtubeId: "eC9M9_r_HPA", openingNumber: 4 },
  { id: "mha-op5", anime: "My Hero Academia", title: "Make My Story", artist: "Lenny Code Fiction", youtubeId: "l4z3T3WrjSE", openingNumber: 5 },
  { id: "mha-op7", anime: "My Hero Academia", title: "Star Marker", artist: "KANA-BOON", youtubeId: "cInIOeOPUdQ", openingNumber: 7 },

  // Demon Slayer
  { id: "ds-op1", anime: "Demon Slayer", title: "Gurenge", artist: "LiSA", youtubeId: "CwkzK-F0Y00", openingNumber: 1 },
  { id: "ds-op2", anime: "Demon Slayer", title: "Zankyou Sanka", artist: "Aimer", youtubeId: "Yrjxc7llYkQ", openingNumber: 2 },
  { id: "ds-op3", anime: "Demon Slayer", title: "Kizuna no Kiseki", artist: "MAN WITH A MISSION x milet", youtubeId: "TLMtdnQpRQY", openingNumber: 3 },

  // Jujutsu Kaisen
  { id: "jjk-op1", anime: "Jujutsu Kaisen", title: "Kaikai Kitan", artist: "Eve", youtubeId: "Ua8V-s5J4cE", openingNumber: 1 },
  { id: "jjk-op2", anime: "Jujutsu Kaisen", title: "VIVID VICE", artist: "Who-ya Extended", youtubeId: "2T3-anJfb-I", openingNumber: 2 },
  { id: "jjk-op3", anime: "Jujutsu Kaisen", title: "Ao no Sumika", artist: "Tatsuya Kitani", youtubeId: "gYhKLoNfVB8", openingNumber: 3 },
  { id: "jjk-op4", anime: "Jujutsu Kaisen", title: "SPECIALZ", artist: "King Gnu", youtubeId: "pF6sCJaPilg", openingNumber: 4 },

  // Tokyo Ghoul
  { id: "tg-op1", anime: "Tokyo Ghoul", title: "Unravel", artist: "TK from Ling Tosite Sigure", youtubeId: "sEQf5lcnj_o", openingNumber: 1 },
  { id: "tg-op2", anime: "Tokyo Ghoul √A", title: "Munou", artist: "österreich", youtubeId: "2WLpjXIXmno", openingNumber: 2 },
  { id: "tg-op3", anime: "Tokyo Ghoul:re", title: "Asphyxia", artist: "Cö shu Nie", youtubeId: "C-o8pTi6vd8", openingNumber: 3 },

  // Bleach
  { id: "bleach-op1", anime: "Bleach", title: "Asterisk", artist: "Orange Range", youtubeId: "EFNQhmDLjTk", openingNumber: 1 },
  { id: "bleach-op2", anime: "Bleach", title: "D-tecnoLife", artist: "UVERworld", youtubeId: "NqOdhmBvxEE", openingNumber: 2 },
  { id: "bleach-op3", anime: "Bleach", title: "Ichirin no Hana", artist: "HIGH and MIGHTY COLOR", youtubeId: "R1vb_7FFUZA", openingNumber: 3 },
  { id: "bleach-op13", anime: "Bleach", title: "Ranbu no Melody", artist: "SID", youtubeId: "f2HqEGn4GUs", openingNumber: 13 },
  { id: "bleach-tybw-op1", anime: "Bleach: TYBW", title: "Scar", artist: "Kitani Tatsuya", youtubeId: "qlNIffTLUbE", openingNumber: 1 },

  // Dragon Ball
  { id: "dbz-op1", anime: "Dragon Ball Z", title: "Cha-La Head-Cha-La", artist: "Hironobu Kageyama", youtubeId: "GHnfX1RmZX8", openingNumber: 1 },
  { id: "dbz-op2", anime: "Dragon Ball Z", title: "We Gotta Power", artist: "Hironobu Kageyama", youtubeId: "e_PyPhGilk4", openingNumber: 2 },
  { id: "dbs-op1", anime: "Dragon Ball Super", title: "Chozetsu Dynamic!", artist: "Kazuya Yoshii", youtubeId: "JLuQnLOSKxg", openingNumber: 1 },

  // Spy x Family
  { id: "sxf-op1", anime: "Spy x Family", title: "Mixed Nuts", artist: "Official HIGE DANdism", youtubeId: "N6JZk7KGzRM", openingNumber: 1 },
  { id: "sxf-op2", anime: "Spy x Family", title: "SOUVENIR", artist: "BUMP OF CHICKEN", youtubeId: "Ud6k1WDKVO4", openingNumber: 2 },

  // Chainsaw Man
  { id: "csm-op1", anime: "Chainsaw Man", title: "KICK BACK", artist: "Kenshi Yonezu", youtubeId: "3W-RVJaM8OU", openingNumber: 1 },

  // Solo Leveling
  { id: "sl-op1", anime: "Solo Leveling", title: "LEveL", artist: "SawanoHiroyuki[nZk]:TOMORROW X TOGETHER", youtubeId: "0f8d-zI0sOc", openingNumber: 1 },

  // Sword Art Online
  { id: "sao-op1", anime: "Sword Art Online", title: "Crossing Field", artist: "LiSA", youtubeId: "n1WpP7iowLc", openingNumber: 1 },
  { id: "sao-op2", anime: "Sword Art Online", title: "Innocence", artist: "Eir Aoi", youtubeId: "6e6pzLxNhmU", openingNumber: 2 },
  { id: "sao-op3", anime: "Sword Art Online II", title: "IGNITE", artist: "Eir Aoi", youtubeId: "Rl0l_S_4Y3E", openingNumber: 3 },
  { id: "sao-op5", anime: "Sword Art Online: Alicization", title: "ADAMAS", artist: "LiSA", youtubeId: "QqsYQP-Udnk", openingNumber: 5 },

  // Steins;Gate
  { id: "sg-op1", anime: "Steins;Gate", title: "Hacking to the Gate", artist: "Kanako Itou", youtubeId: "eFkLGexQ_tQ", openingNumber: 1 },
  { id: "sg0-op1", anime: "Steins;Gate 0", title: "Fatima", artist: "Kanako Itou", youtubeId: "gSR2DN39pjM", openingNumber: 1 },

  // Code Geass
  { id: "cg-op1", anime: "Code Geass", title: "COLORS", artist: "FLOW", youtubeId: "FUH9S44D1BM", openingNumber: 1 },
  { id: "cg-op2", anime: "Code Geass", title: "Kaidoku Funou", artist: "Jinn", youtubeId: "XNHkl1_JbPQ", openingNumber: 2 },
  { id: "cg-op3", anime: "Code Geass R2", title: "O2", artist: "Orange Range", youtubeId: "xuSdLqQoWnQ", openingNumber: 3 },

  // Neon Genesis Evangelion
  { id: "eva-op1", anime: "Neon Genesis Evangelion", title: "A Cruel Angel's Thesis", artist: "Yoko Takahashi", youtubeId: "o6wtDPVkKqI", openingNumber: 1 },

  // Cowboy Bebop
  { id: "cb-op1", anime: "Cowboy Bebop", title: "Tank!", artist: "The Seatbelts", youtubeId: "NRI_8PUXx2A", openingNumber: 1 },

  // Mob Psycho 100
  { id: "mp100-op1", anime: "Mob Psycho 100", title: "99", artist: "MOB CHOIR", youtubeId: "Bw-5Lka7gPE", openingNumber: 1 },
  { id: "mp100-op2", anime: "Mob Psycho 100 II", title: "99.9", artist: "MOB CHOIR", youtubeId: "s7I_rAyjdvk", openingNumber: 2 },
  { id: "mp100-op3", anime: "Mob Psycho 100 III", title: "1", artist: "MOB CHOIR", youtubeId: "E_nFpgXrqlk", openingNumber: 3 },

  // One Punch Man
  { id: "opm-op1", anime: "One Punch Man", title: "THE HERO!!", artist: "JAM Project", youtubeId: "atxYe-nOa9w", openingNumber: 1 },
  { id: "opm-op2", anime: "One Punch Man S2", title: "Seijaku no Apostle", artist: "JAM Project", youtubeId: "eBBOqKnvNzI", openingNumber: 2 },

  // Hunter x Hunter
  { id: "hxh-op1", anime: "Hunter x Hunter (2011)", title: "Departure!", artist: "Masatoshi Ono", youtubeId: "faqmNf_fZlE", openingNumber: 1 },

  // Re:Zero
  { id: "rezero-op1", anime: "Re:Zero", title: "Redo", artist: "Konomi Suzuki", youtubeId: "0L02Zsr9-Ec", openingNumber: 1 },
  { id: "rezero-op2", anime: "Re:Zero", title: "Paradisus-Paradoxum", artist: "MYTH & ROID", youtubeId: "t3OmtIZq2kU", openingNumber: 2 },
  { id: "rezero-op3", anime: "Re:Zero S2", title: "Realize", artist: "Konomi Suzuki", youtubeId: "Q88S1Kc1mos", openingNumber: 3 },

  // Vinland Saga
  { id: "vs-op1", anime: "Vinland Saga", title: "MUKANJYO", artist: "Survive Said The Prophet", youtubeId: "P1F_1zwrRvk", openingNumber: 1 },
  { id: "vs-op2", anime: "Vinland Saga", title: "Dark Crow", artist: "MAN WITH A MISSION", youtubeId: "7edoUwuK2nk", openingNumber: 2 },
  { id: "vs-op3", anime: "Vinland Saga S2", title: "River", artist: "Anonymouz", youtubeId: "bWOqYSoUELM", openingNumber: 3 },

  // Frieren
  { id: "frieren-op1", anime: "Frieren: Beyond Journey's End", title: "Yuusha", artist: "YOASOBI", youtubeId: "a-cNmKOVDYA", openingNumber: 1 },
  { id: "frieren-op2", anime: "Frieren: Beyond Journey's End", title: "Haru e", artist: "Yorushika", youtubeId: "xfwYE72LlBg", openingNumber: 2 },

  // Oshi no Ko
  { id: "onk-op1", anime: "Oshi no Ko", title: "IDOL", artist: "YOASOBI", youtubeId: "ZRtdQ81jPUQ", openingNumber: 1 },
  { id: "onk-op2", anime: "Oshi no Ko S2", title: "Fatale", artist: "GEMN", youtubeId: "k5l3xqjqIig", openingNumber: 2 },

  // Bocchi the Rock
  { id: "btr-op1", anime: "Bocchi the Rock!", title: "Seishun Complex", artist: "Kessoku Band", youtubeId: "3oJCv3jjiaw", openingNumber: 1 },

  // Kaguya-sama
  { id: "kaguya-op1", anime: "Kaguya-sama: Love is War", title: "Love Dramatic", artist: "Masayuki Suzuki feat. Rikka Ihara", youtubeId: "gChTHeHp3wQ", openingNumber: 1 },
  { id: "kaguya-op2", anime: "Kaguya-sama: Love is War S2", title: "DADDY! DADDY! DO!", artist: "Masayuki Suzuki feat. Airi Suzuki", youtubeId: "2Od7QCsyqkE", openingNumber: 2 },
  { id: "kaguya-op3", anime: "Kaguya-sama: Love is War S3", title: "GIRI GIRI", artist: "Masayuki Suzuki feat. Suu", youtubeId: "iHWGVkfdlp4", openingNumber: 3 },

  // Your Lie in April
  { id: "ylia-op1", anime: "Your Lie in April", title: "Hikaru Nara", artist: "Goose house", youtubeId: "SnXkhkEvNIM", openingNumber: 1 },
  { id: "ylia-op2", anime: "Your Lie in April", title: "Nanairo Symphony", artist: "Coalamode.", youtubeId: "5_ij1BAQXGU", openingNumber: 2 },

  // Toradora
  { id: "toradora-op1", anime: "Toradora!", title: "Pre-Parade", artist: "Rie Kugimiya, Yui Horie, Eri Kitamura", youtubeId: "Y3Xmzu0OtS8", openingNumber: 1 },
  { id: "toradora-op2", anime: "Toradora!", title: "Silky Heart", artist: "Yui Horie", youtubeId: "IVQT-stukVU", openingNumber: 2 },

  // Haikyuu
  { id: "haikyuu-op1", anime: "Haikyuu!!", title: "Imagination", artist: "SPYAIR", youtubeId: "JOGp2c7-cKc", openingNumber: 1 },
  { id: "haikyuu-op2", anime: "Haikyuu!!", title: "Ah Yeah!!", artist: "Sukima Switch", youtubeId: "wWBx6hOmVbU", openingNumber: 2 },
  { id: "haikyuu-op3", anime: "Haikyuu!! S2", title: "I'm a Believer", artist: "SPYAIR", youtubeId: "cdMt11bH4Q0", openingNumber: 3 },
  { id: "haikyuu-op4", anime: "Haikyuu!! S2", title: "Fly High!!", artist: "BURNOUT SYNDROMES", youtubeId: "sXmfVVSKoL0", openingNumber: 4 },
  { id: "haikyuu-op5", anime: "Haikyuu!! S3", title: "Hikari Are", artist: "BURNOUT SYNDROMES", youtubeId: "D2wSQNuGHf8", openingNumber: 5 },

  // Kuroko no Basket
  { id: "knb-op1", anime: "Kuroko's Basketball", title: "Can Do", artist: "GRANRODEO", youtubeId: "JxPHUC-qWJI", openingNumber: 1 },
  { id: "knb-op3", anime: "Kuroko's Basketball S2", title: "The Other self", artist: "GRANRODEO", youtubeId: "ZBfqcyRfBM0", openingNumber: 3 },

  // Fate Series
  { id: "fsn-op1", anime: "Fate/stay night: UBW", title: "Ideal White", artist: "Mashiro Ayano", youtubeId: "lT-gG8LeDEI", openingNumber: 1 },
  { id: "fsn-op2", anime: "Fate/stay night: UBW", title: "Brave Shine", artist: "Aimer", youtubeId: "R14bSvdnPI8", openingNumber: 2 },
  { id: "fz-op1", anime: "Fate/Zero", title: "Oath Sign", artist: "LiSA", youtubeId: "GJ4yehnerHQ", openingNumber: 1 },
  { id: "fz-op2", anime: "Fate/Zero", title: "To the Beginning", artist: "Kalafina", youtubeId: "3WZ79Yo_qMU", openingNumber: 2 },

  // Psycho-Pass
  { id: "pp-op1", anime: "Psycho-Pass", title: "Abnormalize", artist: "Ling Tosite Sigure", youtubeId: "YR7kj6khLFU", openingNumber: 1 },
  { id: "pp-op2", anime: "Psycho-Pass", title: "Out of Control", artist: "Nothing's Carved in Stone", youtubeId: "QGhUfhQ-_PI", openingNumber: 2 },

  // Black Clover
  { id: "bc-op1", anime: "Black Clover", title: "Haruka Mirai", artist: "Kankaku Piero", youtubeId: "0i0YLsySNHY", openingNumber: 1 },
  { id: "bc-op3", anime: "Black Clover", title: "Black Rover", artist: "Vickeblanka", youtubeId: "5aJhNiO5QKk", openingNumber: 3 },
  { id: "bc-op10", anime: "Black Clover", title: "Black Catcher", artist: "Vickeblanka", youtubeId: "YsXtfP8NNXA", openingNumber: 10 },
  { id: "bc-op12", anime: "Black Clover", title: "Eien ni Hikare", artist: "TOMORROW X TOGETHER", youtubeId: "7BXMbHq-lic", openingNumber: 12 },

  // Fire Force
  { id: "ff-op1", anime: "Fire Force", title: "Inferno", artist: "Mrs. GREEN APPLE", youtubeId: "JBqxVX_LXvk", openingNumber: 1 },
  { id: "ff-op2", anime: "Fire Force", title: "MAYDAY", artist: "coldrain feat. Ryo from CRYSTAL LAKE", youtubeId: "4xXuNdMBJpQ", openingNumber: 2 },

  // Blue Lock
  { id: "bl-op1", anime: "Blue Lock", title: "CHAOS GA KIWAMARU", artist: "UNISON SQUARE GARDEN", youtubeId: "-lnvFUfgFhA", openingNumber: 1 },
  { id: "bl-op2", anime: "Blue Lock", title: "Judgement", artist: "PENGUIN RESEARCH", youtubeId: "RsqH0PoNhZ8", openingNumber: 2 },

  // Parasyte
  { id: "parasyte-op1", anime: "Parasyte", title: "Let Me Hear", artist: "Fear, and Loathing in Las Vegas", youtubeId: "RJMaW4flZfs", openingNumber: 1 },

  // Noragami
  { id: "noragami-op1", anime: "Noragami", title: "Goya no Machiawase", artist: "Hello Sleepwalkers", youtubeId: "XBwZJ2kWS9Q", openingNumber: 1 },
  { id: "noragami-op2", anime: "Noragami Aragoto", title: "Kyouran Hey Kids!!", artist: "THE ORAL CIGARETTES", youtubeId: "aZenmeRytEM", openingNumber: 2 },

  // Assassination Classroom
  { id: "ac-op1", anime: "Assassination Classroom", title: "Seishun Satsubatsuron", artist: "3-nen E-gumi Utatan", youtubeId: "T0XVIhHNneU", openingNumber: 1 },
  { id: "ac-op3", anime: "Assassination Classroom S2", title: "Question", artist: "3-nen E-gumi Utatan", youtubeId: "G4lMGAB1W3o", openingNumber: 3 },

  // The Promised Neverland
  { id: "tpn-op1", anime: "The Promised Neverland", title: "Touch Off", artist: "UVERworld", youtubeId: "6K88RsEz2Yc", openingNumber: 1 },

  // Made in Abyss
  { id: "mia-op1", anime: "Made in Abyss", title: "Deep in Abyss", artist: "Miyu Tomita & Mariya Ise", youtubeId: "RDI_OX59_9c", openingNumber: 1 },

  // Dr. Stone
  { id: "drstone-op1", anime: "Dr. Stone", title: "Good Morning World!", artist: "BURNOUT SYNDROMES", youtubeId: "kBt2wDk3GnQ", openingNumber: 1 },
  { id: "drstone-op2", anime: "Dr. Stone", title: "Sangenshoku", artist: "PELICAN FANCLUB", youtubeId: "nR-ozdPK18M", openingNumber: 2 },

  // Classroom of the Elite
  { id: "cote-op1", anime: "Classroom of the Elite", title: "Caste Room", artist: "ZAQ", youtubeId: "5wVWvf2LvgA", openingNumber: 1 },
  { id: "cote-op2", anime: "Classroom of the Elite S2", title: "Dance in the Game", artist: "ZAQ", youtubeId: "iepgNF-o6Zs", openingNumber: 2 },

  // Overlord
  { id: "overlord-op1", anime: "Overlord", title: "Clattanoia", artist: "OxT", youtubeId: "jMoVmSV4yA8", openingNumber: 1 },
  { id: "overlord-op3", anime: "Overlord III", title: "VORACITY", artist: "MYTH & ROID", youtubeId: "tl6u2NASUzU", openingNumber: 3 },

  // That Time I Got Reincarnated as a Slime
  { id: "slime-op1", anime: "That Time I Got Reincarnated as a Slime", title: "Nameless Story", artist: "Takuma Terashima", youtubeId: "VdmYPB_u22Y", openingNumber: 1 },
  { id: "slime-op2", anime: "That Time I Got Reincarnated as a Slime", title: "Meguru Mono", artist: "Takuma Terashima", youtubeId: "SJLN0Mq3JjU", openingNumber: 2 },
];

// Helper to get YouTube URL from ID
export function getYouTubeUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

// Helper to search openings
export function searchOpenings(query: string): AnimeOpening[] {
  const lowerQuery = query.toLowerCase();
  return animeOpenings.filter(
    (op) =>
      op.anime.toLowerCase().includes(lowerQuery) ||
      op.title.toLowerCase().includes(lowerQuery) ||
      op.artist.toLowerCase().includes(lowerQuery)
  );
}

// Get all unique anime names
export function getAnimeList(): string[] {
  return [...new Set(animeOpenings.map((op) => op.anime))].sort();
}

// Get openings for a specific anime
export function getOpeningsForAnime(anime: string): AnimeOpening[] {
  return animeOpenings.filter((op) => op.anime === anime);
}

// Get a random opening
export function getRandomOpening(): AnimeOpening {
  return animeOpenings[Math.floor(Math.random() * animeOpenings.length)];
}

