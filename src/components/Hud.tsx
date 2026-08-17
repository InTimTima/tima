import { useEffect, useState } from 'react'
import { audio } from '../audio'
import { indexForNav, nav, profile, t, ui, type NavId } from '../content'
import { useI18n } from '../i18n'
import { goToIndex, subscribeNav } from '../travel'
import { closeDetail } from '../detail'

export function Hud() {
  const { lang, setLang } = useI18n()
  const [section, setSection] = useState<NavId>('info')
  const [muted, setMuted] = useState(() => audio.isMuted())

  useEffect(() => subscribeNav(setSection), [])
  useEffect(() => audio.subscribe(setMuted), [])

  useEffect(() => {
    audio.armAutoplay()
  }, [])

  return (
    <div className="hud">
      <header className="hud__top">
        <div className="hud__brand">
          <span className="hud__mark" />
          <div>
            <strong>{t(profile.name, lang)}</strong>
            <em>{t(profile.role, lang)}</em>
            <p className="hud__hint">{t(ui.openHint, lang)}</p>
          </div>
        </div>

        <div className="hud__right">
          <span className="hud__status">
            <i />
            {t(profile.status, lang)}
          </span>
          <button
            type="button"
            className={`sound ${muted ? 'is-off' : 'is-on'}`}
            onClick={() => audio.toggle()}
            data-cursor="hover"
            aria-pressed={!muted}
            aria-label={t(muted ? ui.soundOff : ui.soundOn, lang)}
            title={t(muted ? ui.soundOff : ui.soundOn, lang)}
          >
            <span className="sound__waves" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
          <div className="lang" role="group" aria-label="Language">
            <button
              type="button"
              className={lang === 'en' ? 'is-on' : ''}
              onClick={() => setLang('en')}
              data-cursor="hover"
            >
              EN
            </button>
            <button
              type="button"
              className={lang === 'ru' ? 'is-on' : ''}
              onClick={() => setLang('ru')}
              data-cursor="hover"
            >
              RU
            </button>
          </div>
        </div>
      </header>

      <nav className="hud__nav" aria-label="Sections">
        {nav.map((item) => (
          <button
            key={item.id}
            type="button"
            className={section === item.id ? 'is-on' : ''}
            title={t(item.hint, lang)}
            data-cursor="hover"
            onClick={() => {
              closeDetail()
              void audio.unlock()
              audio.navPing()
              goToIndex(indexForNav(item.id))
            }}
          >
            {t(item.label, lang)}
          </button>
        ))}
      </nav>
      <div className="hud__reticle" aria-hidden="true" />
    </div>
  )
}
