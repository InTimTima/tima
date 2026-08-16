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
  openHint: { en: 'Click to open', ru: 'Нажми, чтобы открыть' },
  close: { en: 'Close', ru: 'Закрыть' },
  writeMore: { en: 'Details', ru: 'Подробнее' },
}

export const nav: { id: NavId; label: Copy; hint: Copy; targetId: string }[] = [
  { id: 'info', label: { en: 'Info', ru: 'Инфо' }, hint: { en: 'What I do', ru: 'Чем занимаюсь' }, targetId: 'about' },
  { id: 'stack', label: { en: 'Stack', ru: 'Стек' }, hint: { en: 'Skills', ru: 'Навыки' }, targetId: 'skill-flutter' },
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
    id: 'skill-flutter',
    kind: 'skill',
    name: 'Flutter',
    hint: { en: 'One codebase → iOS, Android, web', ru: 'Один код → iOS, Android, web' },
    more: {
      en: 'I build cross-platform apps with Flutter: smooth UI, navigation, state, and packaging for stores and web.',
      ru: 'Делаю кроссплатформенные приложения на Flutter: плавный UI, навигация, стейт и сборка под сторы и web.',
    },
  },
  {
    id: 'skill-dart',
    kind: 'skill',
    name: 'Dart',
    hint: { en: 'Fast UI logic that stays clean', ru: 'Быстрая логика UI без каши' },
    more: {
      en: 'Solid Dart for app architecture — models, services, async flows, and readable code that scales with the product.',
      ru: 'Крепкий Dart для архитектуры приложения — модели, сервисы, async-потоки и читаемый код, который растёт с продуктом.',
    },
  },
  { id: 'photo-2', kind: 'photo', index: 2, src: '/photos/02.jpg' },
  {
    id: 'skill-unity',
    kind: 'skill',
    name: 'Unity',
    hint: { en: '2D arcades & light 3D scenes', ru: '2D-аркады и лёгкий 3D' },
    more: {
      en: 'Arcade feel, procedural levels, camera polish, and light 3D — games that are fun in the first 10 seconds.',
      ru: 'Аркадное ощущение, процедурные уровни, камера и лёгкий 3D — игры, которые затягивают с первых секунд.',
    },
  },
  {
    id: 'skill-csharp',
    kind: 'skill',
    name: 'C#',
    hint: { en: 'Gameplay systems that hold up', ru: 'Геймплейные системы, которые держатся' },
    more: {
      en: 'Gameplay loops, UI, save systems, and tooling in C# — structured enough to extend without rewriting everything.',
      ru: 'Геймплейные циклы, UI, сохранения и тулзы на C# — так, чтобы можно было расширять, а не переписывать всё.',
    },
  },
  {
    id: 'skill-cpp',
    kind: 'skill',
    name: 'C++',
    hint: { en: 'When performance has to bite', ru: 'Когда нужна жёсткая производительность' },
    more: {
      en: 'I reach for C++ when the hot path matters — tight loops, performance-sensitive pieces, and systems that can’t stutter.',
      ru: 'Беру C++, когда важен горячий путь — плотные циклы, производительные куски и системы без фризов.',
    },
  },
  { id: 'photo-3', kind: 'photo', index: 3, src: '/photos/03.jpg' },
  {
    id: 'skill-python',
    kind: 'skill',
    name: 'Python',
    hint: { en: 'Bots, APIs, automation', ru: 'Боты, API, автоматизация' },
    more: {
      en: 'Telegram bots, scripts, small APIs, crypto tools, and automation that saves people hours every week.',
      ru: 'Telegram-боты, скрипты, небольшие API, крипто-инструменты и автоматизация, которая экономит часы каждую неделю.',
    },
  },
  {
    id: 'skill-sql',
    kind: 'skill',
    name: 'SQL',
    hint: { en: 'Data models that don’t lie', ru: 'Модели данных без сюрпризов' },
    more: {
      en: 'Clear schemas, sensible queries, and data that stays consistent as the product grows.',
      ru: 'Понятные схемы, вменяемые запросы и данные, которые остаются консистентными по мере роста продукта.',
    },
  },
  {
    id: 'skill-supabase',
    kind: 'skill',
    name: 'Supabase',
    hint: { en: 'Auth, DB, realtime without drama', ru: 'Auth, БД, realtime без драмы' },
    more: {
      en: 'Auth, Postgres, storage, and realtime — enough backend to ship fast without drowning in DevOps.',
      ru: 'Auth, Postgres, storage и realtime — достаточно бэкенда, чтобы быстро катить, не утонув в DevOps.',
    },
  },
  { id: 'photo-4', kind: 'photo', index: 4, src: '/photos/04.jpg' },
  {
    id: 'skill-ws',
    kind: 'skill',
    name: 'WebSocket',
    hint: { en: 'Live chat & presence', ru: 'Живой чат и присутствие' },
    more: {
      en: 'Realtime messaging, presence, and live updates — the kind of connection you feel in a messenger like Murkot.',
      ru: 'Realtime-сообщения, присутствие и живые обновления — как в мессенджере Murkot.',
    },
  },
  {
    id: 'skill-git',
    kind: 'skill',
    name: 'Git · Vercel',
    hint: { en: 'Ship, iterate, stay online', ru: 'Катить, править, держать онлайн' },
    more: {
      en: 'Clean history, previews, and production deploys — so ideas leave the laptop and hit the internet.',
      ru: 'Чистая история, превью и прод-деплои — чтобы идеи уходили с ноутбука в интернет.',
    },
  },
  { id: 'photo-5', kind: 'photo', index: 5, src: '/photos/05.jpg' },
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
  { id: 'photo-6', kind: 'photo', index: 6, src: '/photos/06.jpg' },
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
      en: 'From learning tools to practical crypto toys — encode and decode with a range of ciphers in a clean interface. Link coming soon.',
      ru: 'От учебных инструментов до практических крипто-игрушек — шифруй и расшифровывай разными шифрами в чистом интерфейсе. Ссылка скоро.',
    },
    stack: ['Python', 'Crypto', 'UI'],
    image: '/projects/shifer.png',
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
