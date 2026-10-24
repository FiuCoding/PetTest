(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.PetOracleData = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DESTINIES = [
    {
      id: "wealth",
      name: "招财小福星",
      title: "一级福气派送员 · 你的专属好运搭子",
      english: "FORTUNE PAW",
      sigil: "福",
      summary: "它带来的不是天降横财，而是一种“愿意把日子过好”的劲头。",
      quote: "它不是来替你改命的，是来提醒你：认真生活的样子，本身就很招财。",
      goodLuck:
        "它未必真的会给你叼来钞票，但它可能让你更愿意早起、更愿意回家，也让平凡的日子多出一点值得期待的东西。对你而言，真正的招财密码，也许就是因为有了它，你更愿意认真生活。那些准时吃饭、认真存下的一小笔钱、下班路上加快的脚步，都是它在悄悄替你攒下的福气。",
      relation:
        "你负责把日子一点点垒高，它负责在你低头赶路时，用一颗毛茸茸的脑袋提醒你：辛苦有回音，期待也值得被认真对待。你们的组合像一只会走动的储蓄罐，投进去的是耐心，取出来的是生活的小确幸。",
      reminder:
        "这个月，和它一起记录三件“小赚到”的瞬间：准点下班、买到爱吃的水果、被它蹭了一下。幸运感，常常从被看见开始。",
      closing: "你以为是你收养了它，其实从此以后，你们一起收养了许多平凡日子里的快乐。",
      shareTitle: "我的毛孩子是「招财小福星」！",
      shareText: "测了才知道，我家小祖宗居然是隐藏的招财小福星。你家的会是什么命？",
      keywords: ["小确幸收藏家", "认真生活", "福气派送中"],
      theme: {
        bg: "#1b1135",
        bg2: "#3b205f",
        accent: "#e8bd70",
        accentSoft: "#fae7bc",
        ink: "#fff8ea",
        aura: "rgba(232, 189, 112, 0.28)",
        motif: "coins",
      },
    },
    {
      id: "noble",
      name: "贵人锦鲤",
      title: "人间善意收集官 · 你的温暖连接器",
      english: "KINDNESS KOI",
      sigil: "鲤",
      summary: "它像一枚小小的善意磁石，让你与世界的连接变得更柔软。",
      quote: "它像一条游进生活的小锦鲤，把散落在人间的善意，慢慢带回你身边。",
      goodLuck:
        "它象征着生活中的善意与连接。因为它，你可能认识更多同样喜欢动物的人，也可能在分享日常的过程中收获意想不到的温暖。所谓贵人运，也许就是你开始更容易看见别人递来的好意，也更愿意接住它。一句“它好可爱”、一次顺手的帮忙、一个因为遛狗而多聊几句的邻居，都可能让普通的一天变得更有人情味。",
      relation:
        "它不太像宠物，更像一张会呼吸的社交名片：散步时多聊的两句、相册里多停留的一眼，都可能变成一段新关系。你原本习惯把心事收好，它却总能替你打开一扇不太费力的小门。",
      reminder:
        "下次有人夸它可爱，别急着说“哪里哪里”，大大方方替它收下这句喜欢。你值得被善意靠近。",
      closing: "它来到你身边，像在提醒你：世界很大，但总有人愿意因为一点可爱，对你温柔。",
      shareTitle: "我家毛孩子竟是「贵人锦鲤」",
      shareText: "别人测星座，我测我家主子的命格。没想到它是贵人锦鲤，快看看你家的。",
      keywords: ["善意循环", "相遇有缘", "人间小锦鲤"],
      theme: {
        bg: "#0f2230",
        bg2: "#19485b",
        accent: "#e5b96e",
        accentSoft: "#fff0ca",
        ink: "#f4fbff",
        aura: "rgba(98, 190, 205, 0.28)",
        motif: "koi",
      },
    },
    {
      id: "healing",
      name: "治愈系天使",
      title: "情绪缓冲带守护者 · 你的柔软休息站",
      english: "GENTLE HEALER",
      sigil: "愈",
      summary: "它最擅长的，是在你快撑不住时，递来一小块安静。",
      quote: "它不一定懂你说的每句话，却总能在你需要的时候，递来一小块安静。",
      goodLuck:
        "它不一定懂你说的每一句话，但它的陪伴可以成为你忙碌生活里的一个温柔停顿。那些没说出口的委屈，会在它靠过来的那几秒里，慢慢松开一点。它带来的好运，叫“我终于允许自己休息”。当它把下巴搁在你的膝盖上，世界没有立刻变好，但你已经不再是一个人扛着。",
      relation:
        "你不需要在它面前表现得很好，也不用解释为什么难过。它只是待在旁边，就已经替你关掉了一部分世界的噪音。你们之间的默契，像一条不用说话就能抵达的暗道。",
      reminder:
        "累的时候，别只顾着给它添粮。也给自己倒杯水，和它一起在窗边坐五分钟。照顾，是双向流动的。",
      closing: "它不是来改变你的命运的，它是来陪你把普通日子过得更有意思的。",
      shareTitle: "我的毛孩子是「治愈系天使」",
      shareText: "它是来治愈我的，还是来当我的小祖宗的？测完发现，答案有点好哭。",
      keywords: ["柔软停靠", "情绪回声", "被看见"],
      theme: {
        bg: "#1b1a35",
        bg2: "#3d355a",
        accent: "#e7cfa0",
        accentSoft: "#fff4dc",
        ink: "#fff9f0",
        aura: "rgba(196, 167, 221, 0.25)",
        motif: "orbs",
      },
    },
    {
      id: "joy",
      name: "快乐能量体",
      title: "家庭气氛组组长 · 24小时快乐供应商",
      english: "JOY SPARK",
      sigil: "乐",
      summary: "它把普通的一天拧开，让笑声从缝隙里冒出来。",
      quote: "它负责把普通的一天，突然拐进一个让人笑出声的剧情。",
      goodLuck:
        "它带来的好运不写在签文里，而藏在你突然笑出来的那几秒。原本沉闷的下午被它撞开一个口子，疲惫也有了歇脚的地方。所谓好运，有时就是生活还愿意逗你开心。它不一定解决你的难题，却会让你有力气再试一次。",
      relation:
        "它是你们家最不按剧本走的那一位，却常常贡献最值得回放的片段。你负责收拾残局，它负责让日子不无聊。你们像一对分工明确的喜剧搭档：一个负责叹气，一个负责把叹气变成笑场。",
      reminder:
        "把它的“犯罪现场”拍下来，别急着生气。三个月后回看，这些大概都会变成你们家的快乐文物。",
      closing: "它未必让日子一路顺风，但它很擅长在逆风里，给你递一个笑点。",
      shareTitle: "我家毛孩子是「快乐能量体」",
      shareText: "测测你家主子是不是隐藏的快乐能量体？我家的测试结果笑死我了。",
      keywords: ["快乐制造机", "气氛组", "笑点担当"],
      theme: {
        bg: "#251334",
        bg2: "#612b52",
        accent: "#f1bf72",
        accentSoft: "#ffe9b8",
        ink: "#fff8f1",
        aura: "rgba(231, 124, 143, 0.24)",
        motif: "spark",
      },
    },
    {
      id: "guardian",
      name: "守护灵搭子",
      title: "深夜巡逻员 · 你的毛茸茸安全区",
      english: "QUIET GUARDIAN",
      sigil: "守",
      summary: "它给你的，是回头时永远不会空的那个位置。",
      quote: "它的爱可能不吵不闹，却总在你回头的时候，稳稳站在那里。",
      goodLuck:
        "它象征安全感、陪伴和一段不被条件交换的感情。你未必需要它替你挡住什么，但知道家里有个小生命在等你，很多难熬的时刻就多了一点底气。它的好运，是让你更敢往前走。无论加班到多晚，门后那阵熟悉的脚步声，都会替你接住一天的疲惫。",
      relation:
        "你们之间有一种不必时时确认的默契：你在忙你的，它趴在不远处；你一起身，它的耳朵先动了。被这样安静地惦记着，本身就是一件很奢侈的事。你们不必热烈表达，却总能准确知道对方在哪里。",
      reminder:
        "别只在它生病时才认真观察它。今晚摸摸它的爪垫，看看耳朵，也让它知道：你一直在注意它。",
      closing: "它不会说话，却用一整个余生，认真回答“我会在”。",
      shareTitle: "我的毛孩子是「守护灵搭子」",
      shareText: "它来到我身边，原来是为了给我一份毛茸茸的安全感。你家主子的隐藏身份是什么？",
      keywords: ["安心感", "无声守护", "双向奔赴"],
      theme: {
        bg: "#101d2a",
        bg2: "#294155",
        accent: "#d9b06a",
        accentSoft: "#ffedc7",
        ink: "#f7fbff",
        aura: "rgba(113, 157, 181, 0.25)",
        motif: "shield",
      },
    },
    {
      id: "growth",
      name: "成长导师",
      title: "生活秩序督导员 · 铲屎官进阶引路人",
      english: "LIFE MENTOR",
      sigil: "长",
      summary: "它用每天的饭点和散步，把你一点点带向更有秩序的生活。",
      quote: "它教会你的，从来不只是怎么养一只宠物，而是怎么认真照顾一个生命，也照顾自己。",
      goodLuck:
        "它带来的好运，往往藏在规律的作息、被需要的责任感和一点点变好的耐心里。你可能因为按时遛它而多走了几步路，因为它的存在而开始为更远的生活做准备。这些变化不够轰轰烈烈，却很结实。某天回头看，你会发现自己已经长成了一个更可靠的大人。",
      relation:
        "它像个不拿工资的生活教练：用饭点教你守时，用掉毛教你接纳，用一次次磨合教你什么叫耐心。养着养着，你也被重新养了一遍。你们的关系不靠惊天动地，而靠每天准时发生的小事。",
      reminder:
        "别把所有耐心都留给它。也给自己设一个“准时吃饭”的提醒，你也是需要被好好照顾的小动物。",
      closing: "它不是来改变你的命运的，它是来陪你把普通日子过得更有意思的。",
      shareTitle: "我的毛孩子是「成长导师」",
      shareText: "养宠之后，我的生活到底被改变了多少？测完发现，我家主子居然是成长导师。",
      keywords: ["耐心生长", "生活秩序", "温柔责任"],
      theme: {
        bg: "#14221d",
        bg2: "#314c3e",
        accent: "#d8b96f",
        accentSoft: "#faedc5",
        ink: "#f8fff8",
        aura: "rgba(102, 156, 115, 0.24)",
        motif: "leaves",
      },
    },
    {
      id: "arrogant",
      name: "傲娇富贵主",
      title: "高冷家庭长官 · 赏脸营业的贵气担当",
      english: "NOBLE ROYAL",
      sigil: "贵",
      summary: "它嘴上不承认，行动里却全是“你终于回来了”。",
      quote: "它不是不爱你，只是觉得，爱你也得保持一点身段。",
      goodLuck:
        "它带来的好运，是让你在“被拿捏”和“心甘情愿”之间反复横跳。它教会你尊重边界，也让你明白：有些感情不靠热烈证明，靠的是它终于愿意挪到你身边的那十厘米。被一只高冷的小家伙偏爱，会让你重新理解“特别”这两个字。",
      relation:
        "它是家里最会拿捏分寸的那位：饭点准时出现，抱它要看心情，犯错时先装无辜。可你一出门，它还是会守在门口——只是绝不承认。你们的日常像一场谁先示弱的比赛，最后总是你先笑。",
      reminder:
        "别急着把它的高冷解读成不爱。试着观察它靠近你的方式：同处一室、睡在你衣服上、用尾巴碰你，都是它笨拙的告白。",
      closing: "它没有选择变得黏人，但它选择了留在你身边。这已经是很大的偏爱。",
      shareTitle: "我的毛孩子是「傲娇富贵主」",
      shareText: "我家小祖宗是高冷领导型，测出来居然是傲娇富贵主，太准了。你家的呢？",
      keywords: ["高冷营业", "反差萌", "嘴硬心软"],
      theme: {
        bg: "#24182d",
        bg2: "#522143",
        accent: "#e2b764",
        accentSoft: "#ffeec8",
        ink: "#fff8f5",
        aura: "rgba(196, 96, 123, 0.22)",
        motif: "crown",
      },
    },
    {
      id: "chaos",
      name: "混世魔王",
      title: "家庭拆家办负责人 · 快乐混乱制造机",
      english: "HAPPY CHAOS",
      sigil: "闯",
      summary: "它负责制造混乱，也负责在混乱里塞满笑声。",
      quote: "它闯的祸很多，但它带来的笑声更多。你嘴上想退货，心里早就签了终身合同。",
      goodLuck:
        "它带来的好运，是把生活从“按部就班”里拽出来。你开始重新认识沙发、纸箱和窗帘的寿命，也开始接受计划之外的小混乱。那些被它搅乱的瞬间，后来都成了你们最舍不得删的故事。它让你相信，不完美的日子也可以很好笑。",
      relation:
        "它像一颗带毛的意外，专门撞碎你的完美主义。你一边收拾残局，一边被它无辜的眼神打败。你们的关系，是一场笑着认输的长期合作。别人家养宠物，你家像是在运营一个小型灾难现场，还附带无限量快乐。",
      reminder:
        "把危险物品收高一点，把垃圾桶盖好，再给它留一个可以尽情拆的纸箱。自由和边界都给足，它才会把家当成游乐场，而不是战场。",
      closing: "它不是来拆你的家的，它是来把你的生活拆出一个透气的口子。",
      shareTitle: "我的毛孩子是「混世魔王」",
      shareText: "它就是来当我的小祖宗的吧！测出来是混世魔王，笑到邻居来敲门。",
      keywords: ["快乐混乱", "拆家艺术家", "笑料制造机"],
      theme: {
        bg: "#2a1524",
        bg2: "#622b35",
        accent: "#f0b968",
        accentSoft: "#ffe5b1",
        ink: "#fff8f0",
        aura: "rgba(229, 124, 83, 0.23)",
        motif: "paws",
      },
    },
  ];

  const QUESTIONS = [
    {
      id: "q1",
      tag: "它的日常",
      question: "你家主子平时最像哪种生物？",
      hint: "凭第一感觉选，不用想太久。",
      options: [
        {
          id: "q1a",
          letter: "A",
          label: "黏人小天使",
          detail: "走到哪跟到哪，像一颗甩不掉的小太阳",
          line: "它总爱黏在你脚边，像一颗甩不掉的小太阳",
          scores: { healing: 2, guardian: 1, wealth: 1 },
          dimensions: { bond: 4, heal: 4, luck: 3 },
        },
        {
          id: "q1b",
          letter: "B",
          label: "高冷小领导",
          detail: "想理你才理你，靠近全看心情",
          line: "它总是一副高冷模样，想理你的时候才肯靠近",
          scores: { arrogant: 3, noble: 1 },
          dimensions: { bond: 2, heal: 2, luck: 4 },
        },
        {
          id: "q1c",
          letter: "C",
          label: "拆家艺术家",
          detail: "精力永远用不完，家里处处是施工现场",
          line: "它的精力永远用不完，家里处处都像施工现场",
          scores: { chaos: 3, joy: 1 },
          dimensions: { bond: 3, heal: 2, luck: 4 },
        },
        {
          id: "q1d",
          letter: "D",
          label: "敏感小可怜",
          detail: "胆子不大，却把最柔软的信任留给你",
          line: "它胆子不大，却把最柔软的信任留给了你",
          scores: { guardian: 3, healing: 1 },
          dimensions: { bond: 4, heal: 3, luck: 2 },
        },
      ],
    },
    {
      id: "q2",
      tag: "低落时刻",
      question: "当你心情不好时，它通常会？",
      hint: "想想那些不太顺利的晚上。",
      options: [
        {
          id: "q2a",
          letter: "A",
          label: "主动靠近我",
          detail: "安静趴在旁边，像在说“我在”",
          line: "它会悄悄靠近，安静陪你坐一会儿",
          scores: { healing: 3, guardian: 1 },
          dimensions: { bond: 4, heal: 4, luck: 3 },
        },
        {
          id: "q2b",
          letter: "B",
          label: "继续做自己的事",
          detail: "但看着它，我就能松一口气",
          line: "它照旧过自己的小日子，可你光是看着它就觉得松一口气",
          scores: { joy: 2, noble: 1 },
          dimensions: { bond: 3, heal: 3, luck: 4 },
        },
        {
          id: "q2c",
          letter: "C",
          label: "用奇怪行为逗我",
          detail: "突然翻肚皮、跑酷，硬把我逗笑",
          line: "它会突然翻肚皮、满屋跑酷，硬是把你逗笑",
          scores: { joy: 3, chaos: 2 },
          dimensions: { bond: 2, heal: 4, luck: 3 },
        },
        {
          id: "q2d",
          letter: "D",
          label: "好像能读懂我",
          detail: "它会变得更黏人，一直跟着我",
          line: "它像装了情绪雷达，你一低落，它就变得更黏人",
          scores: { healing: 2, guardian: 2 },
          dimensions: { bond: 4, heal: 3, luck: 3 },
        },
      ],
    },
    {
      id: "q3",
      tag: "生活变化",
      question: "养它之后，你最大的变化是？",
      hint: "没有标准答案，选最真实的那一个。",
      options: [
        {
          id: "q3a",
          letter: "A",
          label: "生活更有规律",
          detail: "按时起床、按时回家，作息被它治好",
          line: "你开始按时吃饭、按时回家，生活悄悄有了规律",
          scores: { growth: 3, wealth: 1 },
          dimensions: { bond: 3, heal: 3, luck: 4 },
        },
        {
          id: "q3b",
          letter: "B",
          label: "情绪有了出口",
          detail: "没那么孤单，难过时也有人陪",
          line: "你多了一个情绪出口，孤单不再那么满",
          scores: { healing: 2, guardian: 1 },
          dimensions: { bond: 4, heal: 4, luck: 3 },
        },
        {
          id: "q3c",
          letter: "C",
          label: "更有责任感",
          detail: "开始为以后认真打算，也更愿意存钱",
          line: "你更懂责任，也更愿意为以后认真打算",
          scores: { wealth: 2, growth: 2 },
          dimensions: { bond: 3, heal: 2, luck: 4 },
        },
        {
          id: "q3d",
          letter: "D",
          label: "快乐变得更多",
          detail: "普通日子里总有意想不到的惊喜",
          line: "普通日子里多出许多意想不到的快乐",
          scores: { joy: 3, chaos: 1 },
          dimensions: { bond: 3, heal: 4, luck: 4 },
        },
      ],
    },
    {
      id: "q4",
      tag: "小小贪心",
      question: "如果它能送你一份神秘礼物，你最希望是？",
      hint: "贪心一点也没关系。",
      options: [
        {
          id: "q4a",
          letter: "A",
          label: "财运加持",
          detail: "让努力更容易变成看得见的收获",
          line: "你希望它帮你把努力变成看得见的收获",
          scores: { wealth: 3, growth: 1 },
          dimensions: { bond: 3, heal: 2, luck: 4 },
        },
        {
          id: "q4b",
          letter: "B",
          label: "贵人缘加持",
          detail: "遇见更多善意，也认识新的朋友",
          line: "你希望它替你带来更多善意和新的连接",
          scores: { noble: 3 },
          dimensions: { bond: 4, heal: 3, luck: 4 },
        },
        {
          id: "q4c",
          letter: "C",
          label: "情绪稳定",
          detail: "烦恼少一点，心里更松弛",
          line: "你希望它让你的情绪更稳定、烦恼少一点",
          scores: { healing: 3 },
          dimensions: { bond: 4, heal: 4, luck: 3 },
        },
        {
          id: "q4d",
          letter: "D",
          label: "好运常伴",
          detail: "每天都有小惊喜，日子更有盼头",
          line: "你希望每天都有小惊喜，好运常在",
          scores: { joy: 2, wealth: 1, noble: 1 },
          dimensions: { bond: 3, heal: 4, luck: 4 },
        },
      ],
    },
    {
      id: "q5",
      tag: "谁离不开谁",
      question: "你们之间，谁更离不开谁？",
      hint: "嘴硬的话，也可以选真实想法。",
      options: [
        {
          id: "q5a",
          letter: "A",
          label: "我更离不开它",
          detail: "嘴上说它黏人，心里清楚是我需要它",
          line: "嘴上说它黏人，心里却清楚是你更离不开它",
          scores: { guardian: 2, healing: 2 },
          dimensions: { bond: 4, heal: 3, luck: 3 },
        },
        {
          id: "q5b",
          letter: "B",
          label: "它更离不开我",
          detail: "它把我当全世界，我是它的依靠",
          line: "它把你当成全世界，而你也愿意成为它的依靠",
          scores: { guardian: 3, noble: 1 },
          dimensions: { bond: 4, heal: 3, luck: 3 },
        },
        {
          id: "q5c",
          letter: "C",
          label: "表面谁都不服谁",
          detail: "其实谁也离不开谁",
          line: "你们表面互不打扰，其实早已谁也离不开谁",
          scores: { arrogant: 2, guardian: 1, healing: 1 },
          dimensions: { bond: 3, heal: 3, luck: 4 },
        },
        {
          id: "q5d",
          letter: "D",
          label: "它只把我当饭票",
          detail: "我怀疑它爱的是罐头，不是人",
          line: "你偶尔怀疑自己只是饭票，却还是心甘情愿",
          scores: { chaos: 3, arrogant: 1 },
          dimensions: { bond: 2, heal: 4, luck: 3 },
        },
      ],
    },
    {
      id: "q6",
      tag: "秘密任务",
      question: "如果它是神秘世界派来的使者，它的任务会是？",
      hint: "认真你就输了，但我们允许你偷偷相信。",
      options: [
        {
          id: "q6a",
          letter: "A",
          label: "积攒财富和好运",
          detail: "把努力变成收获，把期待变成现实",
          line: "替你积攒财富和好运，把期待变成现实",
          scores: { wealth: 3 },
          dimensions: { bond: 3, heal: 2, luck: 4 },
        },
        {
          id: "q6b",
          letter: "B",
          label: "疗愈情绪、赶走孤独",
          detail: "在你累的时候，替你关掉世界的噪音",
          line: "替你疗愈情绪、赶走孤独，关掉世界的噪音",
          scores: { healing: 3 },
          dimensions: { bond: 4, heal: 4, luck: 3 },
        },
        {
          id: "q6c",
          letter: "C",
          label: "每天逗你笑",
          detail: "把坏心情用奇怪行为赶出去",
          line: "让你每天笑出声，把坏心情赶出去",
          scores: { joy: 3, chaos: 1 },
          dimensions: { bond: 3, heal: 4, luck: 4 },
        },
        {
          id: "q6d",
          letter: "D",
          label: "教你耐心与责任",
          detail: "让你学会照顾另一个生命，也照顾自己",
          line: "教你耐心与责任，也教你怎样好好爱一个生命",
          scores: { growth: 3, guardian: 1 },
          dimensions: { bond: 4, heal: 3, luck: 3 },
        },
      ],
    },
    {
      id: "q7",
      tag: "你们的关系",
      question: "如果用一句话形容你们，你会选？",
      hint: "最后一道，选最像你们的那句。",
      options: [
        {
          id: "q7a",
          letter: "A",
          label: "它是我的小福星",
          detail: "它一来，日子好像顺了一点",
          line: "它是你的小福星，它一来，日子好像顺了一点",
          scores: { wealth: 3, joy: 1 },
          dimensions: { bond: 3, heal: 3, luck: 4 },
        },
        {
          id: "q7b",
          letter: "B",
          label: "它是我最忠实的家人",
          detail: "不用多说，它就在那里",
          line: "它是你最忠实的家人，不用多说，它就在那里",
          scores: { guardian: 3, noble: 1 },
          dimensions: { bond: 4, heal: 4, luck: 3 },
        },
        {
          id: "q7c",
          letter: "C",
          label: "它是我甜蜜的负担",
          detail: "操心是真的，心甘情愿也是真的",
          line: "它是你甜蜜的负担，操心是真的，心甘情愿也是真的",
          scores: { growth: 2, arrogant: 2 },
          dimensions: { bond: 4, heal: 3, luck: 3 },
        },
        {
          id: "q7d",
          letter: "D",
          label: "是它选择了我",
          detail: "不是我选中了它，而是它找到了我",
          line: "是它选择了你，而不只是你选择了它",
          scores: { noble: 3, healing: 1 },
          dimensions: { bond: 4, heal: 4, luck: 4 },
        },
      ],
    },
  ];

  const TIE_ORDER = DESTINIES.map((destiny) => destiny.id);
  const DESTINY_BY_ID = Object.fromEntries(DESTINIES.map((destiny) => [destiny.id, destiny]));
  const QUESTION_BY_ID = Object.fromEntries(QUESTIONS.map((question) => [question.id, question]));
  const ALL_OPTIONS = QUESTIONS.flatMap((question) =>
    question.options.map((option) => ({ ...option, questionId: question.id }))
  );
  const OPTION_BY_ID = Object.fromEntries(ALL_OPTIONS.map((option) => [option.id, option]));

  const DIMENSIONS = {
    bond: {
      label: "主宠羁绊值",
      short: "羁绊",
      description: "来自你们相处中的依赖、默契和彼此在意。",
    },
    heal: {
      label: "治愈能量值",
      short: "治愈",
      description: "来自它让你放松、被安慰和被理解的程度。",
    },
    luck: {
      label: "幸运象征值",
      short: "幸运",
      description: "来自你在日常里感受到的期待与积极变化。",
    },
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function getAnswerObjects(answerIds) {
    if (!Array.isArray(answerIds) || answerIds.length !== QUESTIONS.length) {
      throw new Error("请完成全部题目后再生成结果。");
    }

    return answerIds.map((answerId, index) => {
      const option = OPTION_BY_ID[answerId];
      if (!option || option.questionId !== QUESTIONS[index].id) {
        throw new Error(`第 ${index + 1} 题的答案无效。`);
      }
      return option;
    });
  }

  function hashSignature(answerIds) {
    let hash = 2166136261;
    const source = answerIds.join("|");
    for (let index = 0; index < source.length; index += 1) {
      hash ^= source.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `PX-${(hash >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(-6)}`;
  }

  function getDimensionRange(key) {
    const values = QUESTIONS.map((question) => {
      const optionValues = question.options.map((option) => option.dimensions[key]);
      return { min: Math.min(...optionValues), max: Math.max(...optionValues) };
    });
    return {
      min: values.reduce((total, item) => total + item.min, 0),
      max: values.reduce((total, item) => total + item.max, 0),
    };
  }

  const DIMENSION_RANGES = {
    bond: getDimensionRange("bond"),
    heal: getDimensionRange("heal"),
    luck: getDimensionRange("luck"),
  };

  function calculateResult(answerIds) {
    const answers = getAnswerObjects(answerIds);
    const scores = Object.fromEntries(TIE_ORDER.map((id) => [id, 0]));
    const dimensionPoints = { bond: 0, heal: 0, luck: 0 };

    answers.forEach((option) => {
      Object.entries(option.scores).forEach(([id, points]) => {
        scores[id] += points;
      });
      Object.entries(option.dimensions).forEach(([key, points]) => {
        dimensionPoints[key] += points;
      });
    });

    const ranking = DESTINIES.map((destiny, priorityIndex) => ({
      id: destiny.id,
      name: destiny.name,
      score: scores[destiny.id],
      priority: priorityIndex,
    })).sort((left, right) => right.score - left.score || left.priority - right.priority);

    const winner = DESTINY_BY_ID[ranking[0].id];
    const isTie = ranking[0].score === ranking[1].score;

    const indices = Object.fromEntries(
      Object.entries(dimensionPoints).map(([key, points]) => {
        const range = DIMENSION_RANGES[key];
        const ratio = range.max === range.min ? 0.5 : (points - range.min) / (range.max - range.min);
        return [key, clamp(Math.round(46 + ratio * 52), 0, 100)];
      })
    );

    return {
      destiny: winner,
      answers,
      scores,
      ranking,
      isTie,
      tieRule: "同分时按命格固定序号优先，不进行随机抽取。",
      indices,
      signature: hashSignature(answerIds),
    };
  }

  function buildNarrative(result) {
    const answerByQuestion = Object.fromEntries(
      result.answers.map((option) => [option.questionId, option])
    );
    const q1 = answerByQuestion.q1;
    const q2 = answerByQuestion.q2;
    const q3 = answerByQuestion.q3;
    const q4 = answerByQuestion.q4;
    const q5 = answerByQuestion.q5;
    const q6 = answerByQuestion.q6;
    const q7 = answerByQuestion.q7;

    return {
      relation: `${q1.line}。${q2.line}。${q3.line}。${q5.line}。所以你们的关系，大概就是「${q7.label}」。${result.destiny.relation}`,
      wish: `你曾希望它送你「${q4.label}」。而它真正给你的，也许是把这份期待变成日常的能力——${q6.line}。`,
      summary: `${q1.label} × ${q2.label} × ${q7.label}，这些答案拼出了你们之间独特的相处方式。`,
    };
  }

  function getMetricNotes(indices) {
    return {
      bond:
        indices.bond >= 84
          ? "你们很像彼此默认的家人，离开一会儿都会有点不习惯。"
          : indices.bond >= 66
            ? "你们有稳稳的默契，也保留着各自舒服的小空间。"
            : "你们的相处还在磨合，但愿意彼此理解，就是很好的开始。",
      heal:
        indices.heal >= 84
          ? "它很会接住你的情绪，是日常里一处柔软的缓冲区。"
          : indices.heal >= 66
            ? "它带来的放松不是轰轰烈烈的，而是安静又持续的那种。"
            : "它偶尔也会让你手忙脚乱，但这份真实同样珍贵。",
      luck:
        indices.luck >= 84
          ? "你很会把日常的小好事收进口袋，幸运感经常在线。"
          : indices.luck >= 66
            ? "生活的惊喜不算密集，却总在需要的时候出现。"
            : "你的好运更像慢热型，需要一点耐心和留意。",
    };
  }

  return {
    DESTINIES,
    QUESTIONS,
    TIE_ORDER,
    DESTINY_BY_ID,
    QUESTION_BY_ID,
    OPTION_BY_ID,
    DIMENSIONS,
    DIMENSION_RANGES,
    calculateResult,
    buildNarrative,
    getMetricNotes,
    hashSignature,
  };
});
