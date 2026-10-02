export const MOTIVATIONAL_MESSAGES = [
  'Cada respiração consciente é um pequeno ato de cuidado com você. Hoje você escolheu parar, e isso já é uma vitória.',
  'A calma que você acabou de criar é sua. Você pode voltar a ela sempre que precisar, bastam algumas respirações.',
  'Não existe meditação perfeita, existe a que você fez. Parabéns por aparecer para você mesmo.',
  'Pequenas pausas constroem uma mente mais leve. Você acaba de investir no seu bem-estar.',
  'Sua constância importa mais que a duração. Um minuto de presença hoje já muda o rumo do dia.',
  'Você deu ao seu corpo e à sua mente um momento de descanso. Leve essa leveza para o que vem a seguir.',
]

export const REFLECTIONS = [
  'Como o seu corpo está agora, comparado a antes de começar?',
  'Que pensamento mais apareceu durante a prática? Você conseguiu observá-lo sem se prender a ele?',
  'O que você gostaria de levar desta calma para o resto do seu dia?',
  'Em que parte do corpo você sentiu mais a respiração?',
  'Existe algo que você pode soltar agora, assim como soltou o ar na expiração?',
  'Qual é a sensação que mais se destaca neste momento: leveza, calor, silêncio, cansaço?',
]

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}
