import { Hud } from './components/Hud'
import { SpiralScene } from './components/SpiralScene'
import { useI18n } from './i18n'

export default function App() {
  const { lang } = useI18n()

  return (
    <>
      <SpiralScene lang={lang} />
      <Hud />
    </>
  )
}
