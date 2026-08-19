import { items, profile, ui } from '../content'
import type { Lang } from '../content'
import type { SpiralItem } from '../content'

function setCopy(el: HTMLElement, lang: Lang) {
  el.querySelectorAll<HTMLElement>('[data-en]').forEach((node) => {
    const en = node.dataset.en ?? ''
    const ru = node.dataset.ru ?? en
    node.textContent = lang === 'ru' ? ru : en
  })
}

export function applyLang(root: HTMLElement, lang: Lang) {
  setCopy(root, lang)
}

export function createCard(item: SpiralItem, lang: Lang) {
  const el = document.createElement('article')
  el.className = `node node--${item.kind}`
  el.dataset.kind = item.kind
  el.dataset.id = item.id

  if (item.kind !== 'section') {
    el.setAttribute('role', 'button')
    el.tabIndex = 0
  }

  if (item.kind === 'intro') {
    el.innerHTML = `
      <p class="node__kicker" data-en="${profile.role.en}" data-ru="${profile.role.ru}"></p>
      <h2 data-en="${profile.name.en}" data-ru="${profile.name.ru}"></h2>
      <p class="node__body" data-en="Sites, apps, bots, and games — from idea to launch." data-ru="Сайты, приложения, боты и игры — от идеи до запуска."></p>
    `
  }

  if (item.kind === 'section') {
    el.innerHTML = `
      <p class="node__section-line"></p>
      <h2 class="node__section-title" data-en="${item.title.en}" data-ru="${item.title.ru}"></h2>
      <p class="node__section-sub" data-en="${item.subtitle.en}" data-ru="${item.subtitle.ru}"></p>
      <p class="node__section-line node__section-line--end"></p>
    `
  }

  if (item.kind === 'photo') {
    el.innerHTML = `
      <div class="node__portrait">
        <img src="${item.src}" alt="${ui.photo.en}" decoding="async" />
        <span class="node__portrait-glow"></span>
      </div>
    `
  }

  if (item.kind === 'skill') {
    el.innerHTML = `
      <p class="node__kicker" data-en="${ui.skill.en}" data-ru="${ui.skill.ru}"></p>
      <h3>${item.name}</h3>
      <p class="node__body" data-en="${item.hint.en}" data-ru="${item.hint.ru}"></p>
    `
  }

  if (item.kind === 'project') {
    const link = item.href
      ? `<a class="node__cta" href="${item.href}" target="_blank" rel="noopener noreferrer" data-cursor="hover" data-en="${ui.demo.en}" data-ru="${ui.demo.ru}"></a>`
      : `<span class="node__soon" data-en="${ui.soon.en}" data-ru="${ui.soon.ru}"></span>`
    el.innerHTML = `
      <div class="node__shot">
        <img src="${item.image}" alt="" decoding="async" />
      </div>
      <p class="node__kicker" data-en="${ui.project.en}" data-ru="${ui.project.ru}"></p>
      <h3 data-en="${item.title.en}" data-ru="${item.title.ru}"></h3>
      <p class="node__body" data-en="${item.text.en}" data-ru="${item.text.ru}"></p>
      <ul class="node__tags">${item.stack.map((s) => `<li>${s}</li>`).join('')}</ul>
      ${link}
    `
  }

  if (item.kind === 'about') {
    el.innerHTML = `
      <p class="node__kicker" data-en="About" data-ru="Обо мне"></p>
      <h3 data-en="${ui.aboutTitle.en}" data-ru="${ui.aboutTitle.ru}"></h3>
      <p class="node__body" data-en="${ui.aboutBody.en}" data-ru="${ui.aboutBody.ru}"></p>
      <p class="node__meta" data-en="${profile.location.en} · ${profile.status.en}" data-ru="${profile.location.ru} · ${profile.status.ru}"></p>
    `
  }

  if (item.kind === 'contact') {
    el.innerHTML = `
      <p class="node__kicker" data-en="Contact" data-ru="Контакт"></p>
      <h3 data-en="${ui.contactTitle.en}" data-ru="${ui.contactTitle.ru}"></h3>
      <p class="node__body" data-en="${ui.contactBody.en}" data-ru="${ui.contactBody.ru}"></p>
      <div class="node__links">
        <a href="${profile.telegram}" target="_blank" rel="noopener noreferrer" data-cursor="hover">Telegram · @InTim_tima</a>
        <a href="mailto:${profile.email}?subject=${encodeURIComponent('Project / Заказ')}&body=${encodeURIComponent('Привет, Тимофей!\n\n')}" data-cursor="hover">${profile.email}</a>
        <a href="${profile.github}" target="_blank" rel="noopener noreferrer" data-cursor="hover">GitHub · InTimTima</a>
      </div>
    `
  }

  setCopy(el, lang)
  return el
}

export const CARD_COUNT = items.length
