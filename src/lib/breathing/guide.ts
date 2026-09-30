import type { MethodKey } from '../database.types'

export interface MethodGuide {
  when: string[]
  how: string[]
  tip: string
}

export const METHOD_GUIDES: Record<MethodKey, MethodGuide> = {
  relaxamento: {
    when: [
      'Antes de dormir ou durante uma insônia',
      'Depois de um momento de estresse ou discussão',
      'Para descer a ansiedade antes de um compromisso',
    ],
    how: [
      'Sente-se ou deite-se em um lugar confortável',
      'Inspire pelo nariz em 4 segundos, sem forçar',
      'Expire bem devagar pela boca em 8 segundos, o dobro do tempo da inspiração',
      'Repita por 3 a 5 minutos, sem pausas entre os ciclos',
    ],
    tip: 'A expiração longa ativa o sistema nervoso parassimpático — o "freio" natural do corpo. Se 8 segundos for difícil no início, comece com 6 e aumente aos poucos.',
  },
  equilibrio: {
    when: [
      'No meio do dia, para reequilibrar o humor',
      'Antes de uma tomada de decisão importante',
      'Como prática diária de manutenção, fora de momentos de crise',
    ],
    how: [
      'Sente-se com a coluna ereta',
      'Inspire pelo nariz contando 5 segundos',
      'Expire pelo nariz contando 5 segundos, sem pausas nem esforço',
      'Mantenha o ritmo constante por 3 a 5 minutos',
    ],
    tip: 'A simetria entre inspiração e expiração é o que gera a coerência cardíaca. Priorize a regularidade do ritmo em vez da profundidade da respiração.',
  },
  vigor: {
    when: [
      'Ao acordar, para energizar o corpo',
      'Antes de treinos ou atividades que exigem disposição',
      'Em momentos de sonolência ou baixa energia',
    ],
    how: [
      'Sente-se com a coluna ereta e o abdômen relaxado',
      'Inspire e expire pelo nariz de forma rápida e forçada, enchendo e esvaziando bem os pulmões (1,5s cada fase)',
      'Repita de 15 a 20 vezes seguidas',
      'Pare e respire naturalmente por 15 segundos antes de repetir outro conjunto',
    ],
    tip: 'É uma técnica estimulante — evite praticar perto da hora de dormir. Se sentir tontura, pare e volte à respiração normal.',
  },
  foco: {
    when: [
      'Antes de uma reunião, prova ou apresentação',
      'Para recuperar a concentração no meio do trabalho',
      'Em momentos de pressão, para manter a calma com controle',
    ],
    how: [
      'Sente-se com a postura ereta',
      'Inspire contando 4 segundos',
      'Segure o ar com os pulmões cheios por 4 segundos',
      'Expire contando 4 segundos',
      'Segure com os pulmões vazios por 4 segundos, e recomece o ciclo',
    ],
    tip: 'Técnica usada por atletas e militares para manter o controle sob pressão. As pausas são tão importantes quanto a respiração — resista à vontade de puxar o ar antes da hora.',
  },
  energia: {
    when: [
      'Pela manhã, para despertar o corpo e a mente',
      'Antes de tarefas que exigem alerta mental',
      'Nunca à noite — é uma técnica estimulante',
    ],
    how: [
      'Sente-se com a coluna ereta e uma mão sobre o abdômen',
      'Faça 30 expirações curtas e forçadas pelo nariz, deixando a inspiração acontecer sozinha entre elas',
      'Ao final, inspire profundamente em 4 segundos e segure o ar por 15 segundos',
      'Solte o ar devagar e observe as sensações antes de repetir',
    ],
    tip: 'Evite se tiver pressão alta, glaucoma, enxaqueca ou estiver grávida. Vá com calma na primeira vez — o efeito de "cabeça leve" é esperado, mas deve ser suave.',
  },
  descontracao: {
    when: [
      'No exato momento em que a ansiedade aumenta',
      'Antes de dormir, como ritual de desaceleração',
      'Em pausas curtas ao longo do dia',
    ],
    how: [
      'Encoste a ponta da língua atrás dos dentes da frente (opcional, técnica original)',
      'Inspire pelo nariz em 4 segundos',
      'Segure o ar por 7 segundos',
      'Expire totalmente pela boca em 8 segundos, fazendo um leve som de "whoosh"',
      'Repita de 4 a 8 vezes, no máximo — não é feito para longas sessões',
    ],
    tip: 'É comum sentir um leve tontura nas primeiras vezes; é normal e passa com a prática. Não exagere no número de ciclos, especialmente no início.',
  },
}
