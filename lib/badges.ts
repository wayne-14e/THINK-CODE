export type BadgeIcon = 'trophy' | 'calendar' | 'users' | 'flame' | 'graduation';

export interface BadgeDefinition {
  id: string;
  label: string;
  labelRu: string;
  description: string;
  descriptionRu: string;
  icon: BadgeIcon;
}

/**
 * Admin-awarded badge catalog. Criteria are intentionally manual until the
 * product owner defines automatic rules.
 */
export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    id: 'problem-solver',
    label: 'Problem Solver',
    labelRu: 'Решатель задач',
    description: 'Recognised for a strong problem-solving contribution.',
    descriptionRu: 'Отмечен за сильный вклад в решение задач.',
    icon: 'trophy',
  },
  {
    id: 'workshop-participant',
    label: 'Workshop Participant',
    labelRu: 'Участник воркшопа',
    description: 'Took part in a live academy workshop.',
    descriptionRu: 'Принял участие в живом воркшопе академии.',
    icon: 'calendar',
  },
  {
    id: 'community-referral',
    label: 'Community Builder',
    labelRu: 'Строитель сообщества',
    description: 'Invited a member who joined the community.',
    descriptionRu: 'Пригласил участника, который присоединился к сообществу.',
    icon: 'users',
  },
  {
    id: 'streak-keeper',
    label: 'Streak Keeper',
    labelRu: 'Хранитель серии',
    description: 'Built a consistent practice habit.',
    descriptionRu: 'Выработал привычку регулярной практики.',
    icon: 'flame',
  },
  {
    id: 'track-finisher',
    label: 'Track Finisher',
    labelRu: 'Завершил трек',
    description: 'Completed every module in a syllabus track.',
    descriptionRu: 'Завершил все модули учебного трека.',
    icon: 'graduation',
  },
];

export function getBadgeDefinition(id: string): BadgeDefinition | undefined {
  return BADGE_CATALOG.find((badge) => badge.id === id);
}
