import { useEffect } from 'react'
import { audio } from './audio'
import { CardDetail } from './components/CardDetail'
import { Hud } from './components/Hud'
import { SpiralScene } from './components/SpiralScene'
import { useI18n } from './i18n'

export default function App() {
  const { lang } = useI18n()

  useEffect(() => {
    audio.armAutoplay()
  }, [])

  return (
    <>
      <SpiralScene lang={lang} />
      <Hud />
      <CardDetail />
    </>
  )
}
