import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const bookshelves = [
  {
    title: "拉丁美洲文学",
    note: "时间的粘稠与叙事的政治",
    books: ["加西亚·马尔克斯《百年孤独》", "罗贝托·波拉尼奥《荒野侦探》", "卡洛斯·富恩特斯《阿尔特米奥·克鲁斯之死》", "胡安·鲁尔福《佩德罗·巴拉莫》"],
  },
  {
    title: "德国古典哲学",
    note: "星空、道德律与否定性",
    books: ["康德《纯粹理性批判》《实践理性批判》", "黑格尔《精神现象学》", "马克思《德意志意识形态》"],
  },
  {
    title: "批判理论与当代",
    note: "在总体之外思考",
    books: ["阿多诺《否定辩证法》《最低限度的道德》", "本雅明《历史哲学论纲》", "阿尔都塞《保卫马克思》", "巴迪欧《伦理学》"],
  },
  {
    title: "精神分析与后结构",
    note: "欲望、症候与文本",
    books: ["拉康《文集》", "弗洛伊德《梦的解析》", "胡塞尔《逻辑研究》", "德里达《论文字学》"],
  },
];

const elements = [
  { icon: "✦", label: "星空" },
  { icon: "≈", label: "海洋" },
  { icon: "❆", label: "雪" },
  { icon: "☂", label: "雨" },
  { icon: "☀", label: "恰到好处的阳光" },
  { icon: "〜", label: "和煦的风" },
  { icon: "◐", label: "蓝色" },
];

export default function About() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 pb-10 pt-32">
        <p className="kicker">ABOUT</p>
        <h1 className="mt-3 font-serif text-4xl font-black tracking-[0.12em]">关于</h1>
        <div className="hairline mt-10" />

        {/* 自述 */}
        <section className="measure mt-12 space-y-7 font-serif text-[17px] leading-[2.1] text-justify">
          <p className="dropcap">
            我是 SilentBouquet，现居南方，在腾讯云智担任运维开发工程师，负责元宝业务的运维工作。白天，我与监控曲线、告警和可用性打交道；夜晚，我在马尔克斯与阿多诺之间往返。
          </p>
          <p>
            从高中起，我系统阅读了大量纯文学与哲学原著。文学上偏爱拉丁美洲——马尔克斯的时间、波拉尼奥的流亡、富恩特斯的记忆政治、鲁尔福的死亡语法；哲学上则从德国古典哲学出发，经马克思走向批判理论，也长期阅读精神分析、现象学与后结构主义。
          </p>
          <p>
            我当下的伦理姿态偏向阿多诺：拒绝被任何总体收编，停留在否定之中，忠诚于具体之物。但阿尔都塞的症候阅读与巴迪欧的事件伦理，始终在我身后投下影子——这个网站，就是三者之间的持续协商。
          </p>
          <p>
            这个站点是我的书房：笔记存放碎片，文章存放论证，小说存放虚构。它们共同的问题意识只有一个——在深海与星空之间，如何诚实地写作与生活。
          </p>
        </section>

        {/* 喜欢的元素 */}
        <section className="mt-20">
          <h2 className="font-serif text-2xl font-bold tracking-[0.2em]">私人气象</h2>
          <div className="mt-8 flex flex-wrap gap-4">
            {elements.map((e) => (
              <span
                key={e.label}
                className="flex items-center gap-2 rounded-sm border border-border bg-card px-4 py-2 text-sm tracking-[0.2em] text-muted-foreground"
              >
                <span className="text-primary">{e.icon}</span>
                {e.label}
              </span>
            ))}
          </div>
        </section>

        {/* 书架 */}
        <section className="mt-20">
          <h2 className="font-serif text-2xl font-bold tracking-[0.2em]">书架</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {bookshelves.map((s) => (
              <div key={s.title} className="rounded-sm border border-border bg-card p-6">
                <h3 className="font-serif text-lg font-bold tracking-wide text-primary">{s.title}</h3>
                <p className="mt-1 font-latin text-xs italic text-muted-foreground">{s.note}</p>
                <ul className="mt-4 space-y-2">
                  {s.books.map((b) => (
                    <li key={b} className="text-sm leading-relaxed text-muted-foreground">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 联络 */}
        <section className="mt-20 rounded-sm border border-border bg-secondary/50 p-8 text-center">
          <p className="font-serif text-lg tracking-[0.2em]">与我通信</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            如果你想聊拉丁美洲文学、批判理论，或者只是分享一片海或一场雪——
            <br />
            欢迎写信。雪落进海里也需要零点几秒，而一封信跨越网络只需要一瞬。
          </p>
          <p className="mt-4 font-mono-meta text-sm text-primary">hello [at] silentbouquet.dev</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
