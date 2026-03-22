export interface Skill {
  nome: string
  nivel: number
  nivel_class: string
}

export const skills: Skill[] = [
  { nome: 'HTML', nivel: 90, nivel_class: 'Avançado' },
  { nome: 'CSS', nivel: 90, nivel_class: 'Avançado' },
  { nome: 'JavaScript', nivel: 80, nivel_class: 'Avançado' },
  { nome: 'PHP', nivel: 75, nivel_class: 'Intermediário' },
  { nome: 'Java', nivel: 70, nivel_class: 'Intermediário' },
  { nome: 'Python', nivel: 75, nivel_class: 'Intermediário' },
  { nome: 'React Native', nivel: 85, nivel_class: 'Avançado' },
  { nome: 'Vue', nivel: 35, nivel_class: 'Iniciante' },
  { nome: 'Next', nivel: 70, nivel_class: 'Intermediário' },
]
