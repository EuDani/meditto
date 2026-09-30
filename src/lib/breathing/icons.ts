import { faBolt, faBullseye, faFire, faLeaf, faMoon, faYinYang, type IconDefinition } from '@fortawesome/free-solid-svg-icons'
import type { MethodKey } from '../database.types'

export const METHOD_ICONS: Record<MethodKey, IconDefinition> = {
  relaxamento: faMoon,
  equilibrio: faYinYang,
  vigor: faFire,
  foco: faBullseye,
  energia: faBolt,
  descontracao: faLeaf,
}
