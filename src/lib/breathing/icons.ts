import { faBolt, faBullseye, faFeather, faFire, faLeaf, faLungs, faMoon, faYinYang, type IconDefinition } from '@fortawesome/free-solid-svg-icons'
import type { MethodKey } from '../database.types'

export const METHOD_ICONS: Record<MethodKey, IconDefinition> = {
  relaxamento: faMoon,
  equilibrio: faYinYang,
  vigor: faFire,
  foco: faBullseye,
  energia: faBolt,
  descontracao: faLeaf,
  diafragmatica: faLungs,
  alivio: faFeather,
}
