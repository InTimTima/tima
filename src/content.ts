export type Lang = 'en' | 'ru'

export type Copy = { en: string; ru: string }

export type NavId = 'info' | 'stack' | 'projects' | 'contact'

export type SpiralItem =
  | { id: string; kind: 'intro'; more?: Copy }
  | { id: string; kind: 'photo'; index: number; src: string; more?: Copy }
  | { id: string; kind: 'skill'; name: string; hint: Copy; more?: Copy }
  | {
      id: string
      kind: 'project'
      title: Copy
      text: Copy
      more?: Copy
      stack: string[]
      image: string
      href?: string
    }
  | { id: string; kind: 'about'; more?: Copy }
  | { id: string; kind: 'contact'; more?: Copy }

export const profile = {
  name: { en: 'Timofey', ru: 'Тимофей' },
  role: { en: 'Product developer · apps, games, bots', ru: 'Разработчик продуктов · приложения, игры, боты' },
  status: { en: 'Open to work', ru: 'Открыт к работе' },
  location: { en: 'Russia', ru: 'Россия' },
  email: 'timoha10102006@gmail.com',
  telegram: 'https://t.me/InTim_tima',
  github: 'https://github.com/InTimTima',
}

export const ui = {
  scroll: { en: 'Scroll to travel', ru: 'Скролл — полёт' },
  photo: { en: 'Timofey', ru: 'Тимофей' },
  aboutTitle: { en: 'What I ship', ru: 'Что я делаю' },
  aboutBody: {
    en: 'I build products end to end: websites, mobile apps, messengers, bots, and 2D / light 3D games.',
    ru: 'Собираю продукты целиком: сайты, мобильные приложения, мессенджеры, ботов и игры в 2D / лёгком 3D.',
  },
  contactTitle: { en: 'Let’s build yours', ru: 'Давайте сделаем ваш' },
  contactBody: {
    en: 'Need a site, an app, a bot, or a small game? Write what you want, for whom, and the deadline.',
    ru: 'Нужен сайт, приложение, бот или небольшая игра? Напишите что, для кого и к какому сроку.',
  },
  project: { en: 'Project', ru: 'Проект' },
  skill: { en: 'Skill', ru: 'Навык' },
  demo: { en: 'Open project', ru: 'Открыть проект' },
  soon: { en: 'Link soon', ru: 'Ссылка скоро' },
  code: { en: 'Code', ru: 'Код' },
  soundOn: { en: 'Sound on', ru: 'Звук вкл' },
  soundOff: { en: 'Sound off', ru: 'Звук выкл' },
  openHint: { en: 'Click a card to open it', ru: 'Нажмите на карточку, чтобы открыть' },
  close: { en: 'Close', ru: 'Закрыть' },
  writeMore: { en: 'Details', ru: 'Подробнее' },
}

export const nav: { id: NavId; label: Copy; hint: Copy; targetId: string }[] = [
  { id: 'info', label: { en: 'Info', ru: 'Инфо' }, hint: { en: 'What I do', ru: 'Чем занимаюсь' }, targetId: 'about' },
  { id: 'stack', label: { en: 'Stack', ru: 'Стек' }, hint: { en: 'Skills', ru: 'Навыки' }, targetId: 'skill-mobile' },
  { id: 'projects', label: { en: 'Projects', ru: 'Проекты' }, hint: { en: 'Projects', ru: 'Проекты' }, targetId: 'project-murkot' },
  { id: 'contact', label: { en: 'Contact', ru: 'Контакты' }, hint: { en: 'Contact', ru: 'Контакты' }, targetId: 'contact' },
]

export function navIdFromItem(item: SpiralItem): NavId {
  if (item.kind === 'skill') return 'stack'
  if (item.kind === 'project') return 'projects'
  if (item.kind === 'contact') return 'contact'
  return 'info'
}

export function indexForNav(id: NavId) {
  const spec = nav.find((item) => item.id === id)
  if (!spec) return 0
  const index = items.findIndex((item) => item.id === spec.targetId)
  return index < 0 ? 0 : index
}

export const items: SpiralItem[] = [
  {
    id: 'intro',
    kind: 'intro',
    more: {
      en: 'I turn ideas into shipped products: clean interfaces, working backends, and games that feel good to play. Scroll the spiral — or open any card for the full story.',
      ru: 'Превращаю идеи в готовые продукты: чистые интерфейсы, рабочий бэкенд и игры, в которые приятно играть. Крути спираль — или открой карточку, чтобы узнать больше.',
    },
  },
  {
    id: 'about',
    kind: 'about',
    more: {
      en: 'Flutter & Dart for apps, Unity with C# for gameplay, Python & SQL for backends, Supabase and WebSockets for live systems, Git & Vercel to ship. You get a working thing — not a slide deck. Sites, messengers, bots, 2D and light 3D games — I can take a project from sketch to launch.',
      ru: 'Flutter и Dart для приложений, Unity и C# для геймплея, Python и SQL для бэкенда, Supabase и WebSocket для живых систем, Git и Vercel — чтобы катить. На выходе рабочая вещь, а не презентация. Сайты, мессенджеры, боты, 2D и лёгкий 3D — веду проект от наброска до запуска.',
    },
  },
  { id: 'photo-1', kind: 'photo', index: 1, src: '/photos/01.jpg' },
  {
    id: 'skill-mobile',
    kind: 'skill',
    name: 'Flutter · Dart',
    hint: { en: 'Cross-platform apps from one codebase', ru: 'Кроссплатформенные приложения из одного кода' },
    more: {
      en: 'Flutter for smooth UI on iOS, Android, and web. Dart for clean architecture — models, services, async flows, and store-ready builds.',
      ru: 'Flutter — плавный UI на iOS, Android и web. Dart — чистая архитектура: модели, сервисы, async-потоки и сборки под сторы.',
    },
  },
  { id: 'photo-2', kind: 'photo', index: 2, src: '/photos/02.jpg' },
  {
    id: 'skill-games',
    kind: 'skill',
    name: 'Unity · C# · C++',
    hint: { en: '2D arcades, light 3D, tight performance', ru: '2D-аркады, лёгкий 3D, жёсткая производительность' },
    more: {
      en: 'Unity and C# for gameplay loops, procedural levels, and polish. C++ when the hot path can’t stutter — tight loops and performance-critical pieces.',
      ru: 'Unity и C# — геймплей, процедурные уровни, камера. C++ — когда горячий путь не должен лагать: плотные циклы и производительные куски.',
    },
  },
  { id: 'photo-3', kind: 'photo', index: 3, src: '/photos/03.jpg' },
  {
    id: 'skill-backend',
    kind: 'skill',
    name: 'Python · SQL',
    hint: { en: 'Bots, APIs, and data that stays consistent', ru: 'Боты, API и данные без сюрпризов' },
    more: {
      en: 'Python for Telegram bots, scripts, small APIs, and automation. SQL for clear schemas and queries that stay reliable as the product grows.',
      ru: 'Python — Telegram-боты, скрипты, небольшие API и автоматизация. SQL — понятные схемы и запросы, которые держатся при росте продукта.',
    },
  },
  { id: 'photo-4', kind: 'photo', index: 4, src: '/photos/04.jpg' },
  {
    id: 'skill-realtime',
    kind: 'skill',
    name: 'Supabase · WebSocket',
    hint: { en: 'Auth, database, live updates', ru: 'Auth, база, живые обновления' },
    more: {
      en: 'Supabase for auth, Postgres, storage, and realtime channels. WebSockets for messaging, presence, and live sync — like in Murkot.',
      ru: 'Supabase — auth, Postgres, storage и realtime-каналы. WebSocket — сообщения, присутствие и живая синхронизация, как в Murkot.',
    },
  },
  { id: 'photo-5', kind: 'photo', index: 5, src: '/photos/05.jpg' },
  {
    id: 'skill-ship',
    kind: 'skill',
    name: 'Git · Vercel',
    hint: { en: 'Ship, iterate, stay online', ru: 'Катить, править, держать онлайн' },
    more: {
      en: 'Clean history, previews, and production deploys — so ideas leave the laptop and hit the internet.',
      ru: 'Чистая история, превью и прод-деплои — чтобы идеи уходили с ноутбука в интернет.',
    },
  },
  { id: 'photo-6', kind: 'photo', index: 6, src: '/photos/06.jpg' },
  {
    id: 'project-murkot',
    kind: 'project',
    title: { en: 'Murkot', ru: 'Murkot' },
    text: {
      en: 'Startup for IT people: find a team + full messenger.',
      ru: 'Стартап для айтишников: поиск команды + полноценный мессенджер.',
    },
    more: {
      en: 'Murkot helps developers and specialists find teammates and talk in a real messenger — chats, presence, and a path from “looking” to shipping together. This is my flagship product.',
      ru: 'Murkot помогает разработчикам и специалистам находить тиммейтов и общаться в настоящем мессенджере — чаты, присутствие и путь от поиска к совместной работе. Это мой флагманский продукт.',
    },
    stack: ['Flutter', 'WebSocket', 'Supabase'],
    image: '/projects/murkot.png',
    href: 'https://murkot.vercel.app/',
  },
  {
    id: 'project-igroprofi',
    kind: 'project',
    title: { en: 'igroprofi', ru: 'igroprofi' },
    text: {
      en: 'Interactive learning site for kids with live YooKassa checkout.',
      ru: 'Сайт интерактивов для развития детей с рабочей оплатой через ЮKassa.',
    },
    more: {
      en: 'igroprofi is a web platform with educational mini-games and activities for children. Parents browse interactives, pay through YooKassa, and get instant access — real payments, real product. I built the site, payment flow, and content delivery end to end.',
      ru: 'igroprofi — веб-платформа с обучающими мини-играми и активностями для детей. Родители выбирают интерактивы, оплачивают через ЮKassa и сразу получают доступ — живые платежи, живой продукт. Сайт, оплата и выдача контента собраны целиком.',
    },
    stack: ['Web', 'YooKassa', 'Education'],
    image: '/projects/igroprofi.png',
    href: 'https://igroprofi.ru/',
  },
  {
    id: 'project-run',
    kind: 'project',
    title: { en: 'Run Right', ru: 'Run Right' },
    text: {
      en: 'Arcade runner with procedural levels.',
      ru: 'Аркадный раннер с процедурной генерацией уровней.',
    },
    more: {
      en: 'Every run is a new track. Sharp controls, short sessions, procedural generation — an arcade itch that makes you restart “just one more time”. Link coming soon.',
      ru: 'Каждый забег — новый трек. Точное управление, короткие сессии, процедурная генерация — аркадная зависимость «ещё разок». Ссылка скоро.',
    },
    stack: ['Unity', 'C#', 'Procedural'],
    image: '/projects/run-right.png',
  },
  {
    id: 'project-shifer',
    kind: 'project',
    title: { en: 'Shifer', ru: 'Shifer' },
    text: {
      en: 'Encrypt & decrypt with classic and advanced ciphers.',
      ru: 'Шифрование и дешифрование простыми и сложными шифрами.',
    },
    more: {
      en: 'From learning tools to practical crypto toys — encode and decode with a range of ciphers in a clean interface. Caesar, Vigenère, and more — pick a cipher, type a message, see the result instantly.',
      ru: 'От учебных инструментов до практических крипто-игрушек — шифруй и расшифровывай разными шифрами в чистом интерфейсе. Цезарь, Виженер и другие — выбирай шифр, вводи текст, сразу видишь результат.',
    },
    stack: ['Python', 'Crypto', 'UI'],
    image: '/projects/shifer.png',
    href: 'https://shifer.vercel.app',
  },
  {
    id: 'contact',
    kind: 'contact',
    more: {
      en: 'Telegram is fastest. Email works too. Tell me what you need, for whom, and the deadline — I’ll reply with a clear plan and price.',
      ru: 'Быстрее всего — Telegram. Почта тоже ок. Напишите что нужно, для кого и к какому сроку — отвечу планом и ценой.',
    },
  },
]

export function t(copy: Copy, lang: Lang) {
  return copy[lang]
}
