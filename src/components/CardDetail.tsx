import { useEffect, useState } from 'react'
import { profile, t, ui, type SpiralItem } from '../content'
import { closeDetail, subscribeDetail } from '../detail'
import { useI18n } from '../i18n'
import { audio } from '../audio'

function titleFor(item: SpiralItem, lang: 'en' | 'ru') {
  if (item.kind === 'intro') return t(profile.name, lang)
  if (item.kind === 'about') return t(ui.aboutTitle, lang)
  if (item.kind === 'contact') return t(ui.contactTitle, lang)
  if (item.kind === 'skill') return item.name
  if (item.kind === 'project') return t(item.title, lang)
  if (item.kind === 'photo') return t(ui.photo, lang)
  return ''
}

function bodyFor(item: SpiralItem, lang: 'en' | 'ru') {
  if (item.more) return t(item.more, lang)
  if (item.kind === 'skill') return t(item.hint, lang)
  if (item.kind === 'project') return t(item.text, lang)
  if (item.kind === 'about') return t(ui.aboutBody, lang)
  if (item.kind === 'contact') return t(ui.contactBody, lang)
  if (item.kind === 'intro') {
    return lang === 'ru'
      ? 'Сайты, приложения, боты и игры — от идеи до запуска.'
      : 'Sites, apps, bots, and games — from idea to launch.'
  }
  return ''
}

export function CardDetail() {
  const { lang } = useI18n()
  const [item, setItem] = useState<SpiralItem | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    return subscribeDetail((next) => {
      if (next) {
        setItem(next)
        requestAnimationFrame(() => setVisible(true))
      } else {
        setVisible(false)
        window.setTimeout(() => setItem(null), 280)
      }
    })
  }, [])

  useEffect(() => {
    if (!item) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDetail()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [item])

  if (!item) return null

  const title = titleFor(item, lang)
  const body = bodyFor(item, lang)

  return (
    <div
      className={`detail ${visible ? 'is-on' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={() => closeDetail()}
    >
      <article
        className={`detail__card detail__card--${item.kind}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="detail__close"
          data-cursor="hover"
          aria-label={t(ui.close, lang)}
          onClick={() => closeDetail()}
        >
          ×
        </button>

        {item.kind === 'photo' && (
          <div className="detail__media">
            <img src={item.src} alt={title} />
          </div>
        )}

        {item.kind === 'project' && (
          <div className="detail__media">
            <img src={item.image} alt={title} />
          </div>
        )}

        <p className="detail__kicker">
          {item.kind === 'skill' && t(ui.skill, lang)}
          {item.kind === 'project' && t(ui.project, lang)}
          {item.kind === 'about' && (lang === 'ru' ? 'Обо мне' : 'About')}
          {item.kind === 'contact' && (lang === 'ru' ? 'Контакт' : 'Contact')}
          {item.kind === 'intro' && t(profile.role, lang)}
          {item.kind === 'photo' && t(ui.photo, lang)}
        </p>
        <h2>{title}</h2>
        <p className="detail__body">{body}</p>

        {item.kind === 'project' && (
          <>
            <ul className="detail__tags">
              {item.stack.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            {item.href ? (
              <a
                className="detail__cta"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="hover"
                onClick={() => void audio.unlock()}
              >
                {t(ui.demo, lang)}
              </a>
            ) : (
              <span className="detail__soon">{t(ui.soon, lang)}</span>
            )}
          </>
        )}

        {item.kind === 'contact' && (
          <div className="detail__links">
            <a
              href={profile.telegram}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              onClick={() => void audio.unlock()}
            >
              Telegram · @InTim_tima
            </a>
            <a
              href={`mailto:${profile.email}?subject=${encodeURIComponent('Project / Заказ')}&body=${encodeURIComponent('Привет, Тимофей!\n\n')}`}
              data-cursor="hover"
            >
              {profile.email}
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              onClick={() => void audio.unlock()}
            >
              GitHub · InTimTima
            </a>
          </div>
        )}

        {item.kind === 'about' && (
          <p className="detail__meta">
            {t(profile.location, lang)} · {t(profile.status, lang)}
          </p>
        )}
      </article>
    </div>
  )
}
