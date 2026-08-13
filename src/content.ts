export type Lang = 'en' | 'ru'

export type Copy = { en: string; ru: string }

export type NavId = 'info' | 'stack' | 'projects' | 'contact'

export type SpiralItem =
  | { id: string; kind: 'intro' }
  | { id: string; kind: 'photo'; index: number; src: string }
  | { id: string; kind: 'skill'; name: string; hint: Copy }
  | {
      id: string
      kind: 'project'
      title: Copy
      text: Copy
      stack: string[]
      image: string
      href?: string
    }
  | { id: string; kind: 'about' }
  | { id: string; kind: 'contact' }

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
    en: 'I build products end to end: websites, mobile apps, messengers, bots, and 2D / light 3D games. Flutter & Dart for apps, Unity with C# for gameplay, Python & SQL for backends, Supabase and WebSockets for live systems, Git & Vercel to ship. You get a working thing — not a slide deck.',
    ru: 'Собираю продукты целиком: сайты, мобильные приложения, мессенджеры, ботов и игры в 2D / лёгком 3D. Flutter и Dart для приложений, Unity и C# для геймплея, Python и SQL для бэкенда, Supabase и WebSocket для живых систем, Git и Vercel — чтобы катить. На выходе рабочая вещь, а не презентация.',
  },
  contactTitle: { en: 'Let’s build yours', ru: 'Давайте сделаем ваш' },
  contactBody: {
    en: 'Need a site, an app, a bot, or a small game? Write what you want, for whom, and the deadline — I’ll reply with a clear plan and price.',
    ru: 'Нужен сайт, приложение, бот или небольшая игра? Напишите что, для кого и к какому сроку — отвечу планом и ценой.',
  },
  project: { en: 'Project', ru: 'Проект' },
  skill: { en: 'Skill', ru: 'Навык' },
  demo: { en: 'Open', ru: 'Открыть' },
  soon: { en: 'Link soon', ru: 'Ссылка скоро' },
  code: { en: 'Code', ru: 'Код' },
  soundOn: { en: 'Sound on', ru: 'Звук вкл' },
  soundOff: { en: 'Sound off', ru: 'Звук выкл' },
}

export const nav: { id: NavId; label: Copy; hint: Copy; targetId: string }[] = [
  { id: 'info', label: { en: 'Info', ru: 'Инфо' }, hint: { en: 'Overview', ru: 'Общая информация' }, targetId: 'intro' },
  { id: 'stack', label: { en: 'Stack', ru: 'Стек' }, hint: { en: 'Stack', ru: 'Стек' }, targetId: 'skill-flutter' },
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
  { id: 'intro', kind: 'intro' },
  { id: 'photo-1', kind: 'photo', index: 1, src: '/photos/01.jpg' },
  {
    id: 'skill-flutter',
    kind: 'skill',
    name: 'Flutter',
    hint: { en: 'One codebase → iOS, Android, web', ru: 'Один код → iOS, Android, web' },
  },
  { id: 'photo-2', kind: 'photo', index: 2, src: '/photos/02.jpg' },
  {
    id: 'skill-dart',
    kind: 'skill',
    name: 'Dart',
    hint: { en: 'Fast UI logic that stays clean', ru: 'Быстрая логика UI без каши' },
  },
  {
    id: 'project-murkot',
    kind: 'project',
    title: { en: 'Murkot', ru: 'Murkot' },
    text: {
      en: 'Flagship startup: IT people find a team, talk in a full messenger, and move from “looking” to shipping together.',
      ru: 'Флагманский стартап: айтишники находят команду, общаются в полноценном мессенджере и переходят от поиска к совместной работе.',
    },
    stack: ['Flutter', 'WebSocket', 'Supabase'],
    image: '/projects/murkot.png',
    href: 'https://murkot.vercel.app/',
  },
  { id: 'photo-3', kind: 'photo', index: 3, src: '/photos/03.jpg' },
  {
    id: 'skill-unity',
    kind: 'skill',
    name: 'Unity',
    hint: { en: '2D arcades & light 3D scenes', ru: '2D-аркады и лёгкий 3D' },
  },
  {
    id: 'skill-csharp',
    kind: 'skill',
    name: 'C#',
    hint: { en: 'Gameplay systems that hold up', ru: 'Геймплейные системы, которые держатся' },
  },
  { id: 'photo-4', kind: 'photo', index: 4, src: '/photos/04.jpg' },
  { id: 'about', kind: 'about' },
  {
    id: 'skill-cpp',
    kind: 'skill',
    name: 'C++',
    hint: { en: 'When performance has to bite', ru: 'Когда нужна жёсткая производительность' },
  },
  { id: 'photo-5', kind: 'photo', index: 5, src: '/photos/05.jpg' },
  {
    id: 'project-run',
    kind: 'project',
    title: { en: 'Run Right', ru: 'Run Right' },
    text: {
      en: 'Arcade runner with procedural levels — every run is a new track. Sharp controls, short sessions, replay itch.',
      ru: 'Аркадный раннер с процедурной генерацией уровней — каждый забег новый. Точное управление, короткие сессии, хочется ещё раз.',
    },
    stack: ['Unity', 'C#', 'Procedural'],
    image: '/projects/run-right.png',
  },
  {
    id: 'skill-python',
    kind: 'skill',
    name: 'Python',
    hint: { en: 'Bots, APIs, automation', ru: 'Боты, API, автоматизация' },
  },
  {
    id: 'skill-sql',
    kind: 'skill',
    name: 'SQL',
    hint: { en: 'Data models that don’t lie', ru: 'Модели данных без сюрпризов' },
  },
  { id: 'photo-6', kind: 'photo', index: 6, src: '/photos/06.jpg' },
  {
    id: 'project-shifer',
    kind: 'project',
    title: { en: 'Shifer', ru: 'Shifer' },
    text: {
      en: 'Encrypt and decrypt with classic and advanced ciphers — from learning tools to practical crypto toys.',
      ru: 'Шифрование и дешифрование простыми и сложными шифрами — от учебных инструментов до практических крипто-игрушек.',
    },
    stack: ['Python', 'Crypto', 'UI'],
    image: '/projects/shifer.png',
  },
  {
    id: 'skill-supabase',
    kind: 'skill',
    name: 'Supabase',
    hint: { en: 'Auth, DB, realtime without drama', ru: 'Auth, БД, realtime без драмы' },
  },
  {
    id: 'skill-ws',
    kind: 'skill',
    name: 'WebSocket',
    hint: { en: 'Live chat & presence', ru: 'Живой чат и присутствие' },
  },
  {
    id: 'skill-git',
    kind: 'skill',
    name: 'Git · Vercel',
    hint: { en: 'Ship, iterate, stay online', ru: 'Катить, править, держать онлайн' },
  },
  { id: 'contact', kind: 'contact' },
]

export function t(copy: Copy, lang: Lang) {
  return copy[lang]
}
