'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';

export type Language = 'en' | 'ru';

const LANGUAGE_STORAGE_KEY = 'thinkcode_language';
const languageListeners = new Set<() => void>();

function subscribeLanguage(callback: () => void) {
  languageListeners.add(callback);
  return () => {
    languageListeners.delete(callback);
  };
}

function getLanguageSnapshot(): Language {
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'ru' ? 'ru' : 'en';
  } catch {
    return 'en';
  }
}

function getServerLanguageSnapshot(): Language {
  return 'en';
}

/**
 * Russian UI-chrome translations. Keys are the English source strings so a
 * missing translation falls back to readable English instead of a raw key.
 * Learning content, problem statements, editorials, and workshop copy remain
 * authored content and are not machine-translated here.
 */
const RU: Record<string, string> = {
  // Shared shell and auth
  'Loading THINK//CODE...': 'Загрузка THINK//CODE...',
  Overview: 'Обзор',
  Syllabus: 'Программа',
  Challenges: 'Задачи',
  Workshops: 'Воркшопы',
  Leaderboard: 'Рейтинг',
  Profile: 'Профиль',
  Compose: 'Редактор',
  Community: 'Сообщество',
  'Sign in': 'Войти',
  'Sign out': 'Выйти',
  Member: 'Участник',
  'Think. Code. Repeat.': 'Думай. Кодируй. Повторяй.',
  'Streak {days}d': 'Серия {days} дн.',
  'XP {xp}': 'XP {xp}',
  'Sign in to THINK//CODE': 'Вход в THINK//CODE',
  'Continue with Google': 'Продолжить с Google',
  'Continue with GitHub': 'Продолжить с GitHub',
  'Close sign-in dialog': 'Закрыть окно входа',
  'Deliberate practice · Human mentors': 'Осознанная практика · Живые менторы',
  'You can add optional GitHub and Telegram contact handles from your Profile tab after signing in.':
    'После входа вы можете добавить необязательные контакты GitHub и Telegram в профиле.',
  'THINK//CODE Academy': 'Академия THINK//CODE',
  'Primary navigation': 'Основная навигация',
  'Mobile navigation': 'Мобильная навигация',
  'Expand side panel': 'Развернуть панель',
  'Collapse side panel': 'Свернуть панель',
  'English': 'Английский',
  'Russian': 'Русский',
  'Switch language': 'Сменить язык',

  // Community links
  'Telegram community': 'Сообщество в Telegram',
  'Discord server': 'Сервер Discord',
  'Share feedback': 'Оставить отзыв',
  'Open Telegram': 'Открыть Telegram',
  'Open Discord': 'Открыть Discord',
  'Feedback form': 'Форма обратной связи',
  'Community links are configured by the academy owner.': 'Ссылки сообщества настраиваются владельцем академии.',

  // Landing
  'Competitive Programming · Human Mentors': 'Спортивное программирование · Живые менторы',
  'Think first. Code deeper.': 'Сначала думай. Код — глубже.',
  'Build algorithmic confidence through deliberate practice, real mentors, and a community that codes together.':
    'Развивайте алгоритмическую уверенность через осознанную практику, живых менторов и сообщество, которое кодит вместе.',
  'Start practicing': 'Начать практику',
  Practice: 'Практика',
  Tracks: 'Треки',
  'Think before you run.': 'Думай до запуска.',
  'Work through the state before you touch the keyboard.': 'Пройдите состояние вручную, прежде чем трогать клавиатуру.',
  'Live Trace Check': 'Живая проверка трассировки',
  'Verify trace': 'Проверить трассировку',
  'Trace verified': 'Трассировка верна',
  'Trace it line by line': 'Прогоните построчно',
  'Four core tracks.': 'Четыре основных трека.',
  '{count} modules': '{count} модулей',
  'Live Workshop · {issue} · {date}': 'Живой воркшоп · {issue} · {date}',
  'Live Problem Breakdown': 'Живой разбор задачи',
  'Live problem breakdowns, real mentors, and room for your questions.':
    'Живые разборы задач, настоящие менторы и место для ваших вопросов.',
  'Join with Google or GitHub': 'Войти через Google или GitHub',
  '{tracks} Tracks · {problems} Challenges': '{tracks} треков · {problems} задач',
  'Python · JavaScript · C++': 'Python · JavaScript · C++',
  'Brand logo': 'Логотип бренда',

  // Overview
  'Daily Challenge': 'Задача дня',
  'Open workspace': 'Открыть рабочее пространство',
  'All challenges': 'Все задачи',
  "Today's flow": 'Порядок на сегодня',
  'Trace check': 'Проверка трассировки',
  'Passed. The reasoning is saved.': 'Пройдено. Рассуждение сохранено.',
  'Predict the output before running.': 'Предскажите вывод до запуска.',
  'Implement and submit': 'Реализовать и отправить',
  'Accepted. Nice work.': 'Принято. Отличная работа.',
  'Not submitted yet.': 'Ещё не отправлено.',
  'Review the editorial': 'Разобрать редакторский ответ',
  'Compare your approach after a real attempt.': 'Сравните подход после реальной попытки.',
  'Total XP': 'Всего XP',
  Streak: 'Серия',
  Solved: 'Решено',
  Modules: 'Модули',
  'Open syllabus': 'Открыть программу',
  'Workshop {issue}': 'Воркшоп {issue}',
  'Your time · {date}': 'Ваше время · {date}',
  'View workshop & RSVP': 'Открыть воркшоп и RSVP',
  'Top Members': 'Лучшие участники',
  Rankings: 'Рейтинг',
  'No ranked members yet.': 'Пока нет участников в рейтинге.',

  // Syllabus
  'Track {order}': 'Трек {order}',
  XP: 'XP',
  Reading: 'Чтение',
  Progress: 'Прогресс',
  '{done}/{total} ({pct}%)': '{done}/{total} ({pct}%)',
  Done: 'Готово',
  Notes: 'Конспект',
  'Hide notes': 'Скрыть конспект',
  'Mark done': 'Отметить готовым',
  Completed: 'Завершено',
  'Saving...': 'Сохранение...',
  Solve: 'Решить',
  'Sign in to save progress.': 'Войдите, чтобы сохранять прогресс.',

  // Challenges
  easy: 'лёгкая',
  medium: 'средняя',
  hard: 'сложная',
  'All difficulties': 'Все сложности',
  'Filter by track': 'Фильтр по треку',
  'All tracks': 'Все треки',
  'Search...': 'Поиск...',
  'Search challenges': 'Поиск задач',
  Status: 'Статус',
  Challenge: 'Задача',
  Track: 'Трек',
  Difficulty: 'Сложность',
  Action: 'Действие',
  'No matching challenges.': 'Нет подходящих задач.',
  Accepted: 'Принято',
  Unsolved: 'Не решено',
  Daily: 'День',
  Trace: 'Трассировка',

  // Sandbox
  Running: 'Выполняется',
  'Time Limit Exceeded': 'Превышен лимит времени',
  'Wrong Answer': 'Неверный ответ',
  'Runtime Error': 'Ошибка выполнения',
  Description: 'Описание',
  Problem: 'Задача',
  Editor: 'Редактор',
  'Think Check': 'Проверка мышления',
  Editorial: 'Разбор',
  'Mentor Discussion ({count})': 'Вопросы менторам ({count})',
  Examples: 'Примеры',
  'Input:': 'Ввод:',
  'Output:': 'Вывод:',
  Constraints: 'Ограничения',
  'Think Before You Run (+15 XP)': 'Думай до запуска (+15 XP)',
  'Prediction choices': 'Варианты прогноза',
  'Verify prediction': 'Проверить прогноз',
  'Trace again': 'Попробуйте ещё раз',
  'Walk through each variable binding line by line before selecting another answer.':
    'Пройдите каждое связывание переменных построчно, прежде чем выбрать другой ответ.',
  'Official Academy Editorial': 'Официальный разбор академии',
  'Ask a Human Mentor': 'Спросить живого ментора',
  'Share your reasoning or snippet. Academy mentors and peers review questions directly.':
    'Поделитесь рассуждением или фрагментом кода. Менторы академии и участники отвечают напрямую.',
  'Explain where your trace diverges or share an optimization idea...':
    'Объясните, где расходится ваша трассировка, или поделитесь идеей оптимизации...',
  'Sign in at the top right to post a question...': 'Войдите справа сверху, чтобы задать вопрос...',
  'Snippet language': 'Язык фрагмента',
  'No code snippet': 'Без фрагмента кода',
  'Python snippet': 'Фрагмент Python',
  'JavaScript snippet': 'Фрагмент JavaScript',
  'C++ snippet': 'Фрагмент C++',
  'Paste optional short snippet...': 'Вставьте необязательный короткий фрагмент...',
  'Posting...': 'Отправка...',
  Post: 'Отправить',
  'No questions posted yet. Start the discussion above.':
    'Вопросов пока нет. Начните обсуждение выше.',
  Mentor: 'Ментор',
  Pinned: 'Закреплено',
  Unpin: 'Открепить',
  Pin: 'Закрепить',
  'Unmark mentor': 'Снять метку ментора',
  'Mark mentor': 'Отметить ментора',
  'Programming language': 'Язык программирования',
  'Reset starter code': 'Сбросить стартовый код',
  'Resize problem and editor panels': 'Изменить ширину панелей задачи и редактора',
  Reset: 'Сброс',
  'Run code': 'Запустить код',
  'Running...': 'Выполняется...',
  'Submit solution': 'Отправить решение',
  'Submitting...': 'Отправка...',
  'Test Output': 'Результат тестов',
  '{passed}/{total} passed': '{passed}/{total} пройдено',
  '{ms} ms': '{ms} мс',
  Piston: 'Piston',
  'Local JS': 'Локальный JS',
  'Local Python': 'Локальный Python',
  'Config needed': 'Нужна настройка',
  'Run code to check visible sample cases, or Submit solution to evaluate hidden edge cases.':
    'Запустите код для видимых примеров или отправьте решение для проверки скрытых случаев.',
  'Hidden {index}': 'Скрытый {index}',
  'Case {index}': 'Случай {index}',
  Input: 'Ввод',
  Expected: 'Ожидалось',
  Error: 'Ошибка',
  'Actual Output': 'Фактический вывод',
  '(empty)': '(пусто)',
  'Sign in to save submissions, XP, and daily streaks.':
    'Войдите, чтобы сохранять отправки, XP и ежедневные серии.',
  'Saved submission (+{xp} XP awarded).': 'Отправка сохранена (+{xp} XP).',
  'Submission recorded to your profile history.': 'Отправка записана в историю профиля.',
  'Executed locally. Admin curriculum sync is required to persist cloud submissions for starter problems.':
    'Выполнено локально. Для сохранения отправок нужно синхронизировать программу администратором.',
  'This starter problem has not been synced to Firestore yet. Ask an admin to run Sync Starter Curriculum in Compose.':
    'Эта стартовая задача ещё не синхронизирована с Firestore. Попросите администратора запустить синхронизацию в редакторе.',

  // Workshops
  'Live problem breakdowns': 'Живые разборы задач',
  '{count} going': 'Идут: {count}',
  'Academy time · {date} · {tz}': 'Время академии · {date} · {tz}',
  'Prerequisites:': 'Требования:',
  'Updating...': 'Обновление...',
  'Going (Cancel)': 'Иду (отменить)',
  RSVP: 'Записаться',
  'Session link': 'Ссылка на сессию',
  Archive: 'Архив',
  All: 'Все',
  'No archived workshops in this track.': 'В этом треке пока нет архивных воркшопов.',
  Slides: 'Слайды',
  Repo: 'Репозиторий',
  Notebook: 'Ноутбук',
  Problems: 'Задачи',
  Replay: 'Запись',
  Agenda: 'План',
  Materials: 'Материалы',
  'Does this topic work for you?': 'Вам подходит эта тема?',
  'Yes, works for me': 'Да, мне подходит',
  'Suggest another topic': 'Предложить другую тему',
  'Your suggestion': 'Ваше предложение',
  'Submit feedback': 'Отправить отзыв',
  'Feedback saved.': 'Отзыв сохранён.',
  'Sign in to share topic feedback.': 'Войдите, чтобы поделиться мнением о теме.',
  'Suggested topic is required when the current topic does not work for you.':
    'Если тема не подходит, укажите предложение.',
  '{works} works · {suggests} suggestions': 'Подходит: {works} · Предложений: {suggests}',
  'Member suggestions': 'Предложения участников',
  'No topic feedback yet.': 'Пока нет отзывов о теме.',
  'Sign in to RSVP for live workshops.': 'Войдите, чтобы записаться на живой воркшоп.',
  'This starter workshop has not been synced to Firestore yet. Ask an admin to run Sync Starter Curriculum in Compose.':
    'Этот стартовый воркшоп ещё не синхронизирован с Firestore. Попросите администратора запустить синхронизацию в редакторе.',
  'Sign in first to RSVP.': 'Сначала войдите, чтобы записаться.',
  'Unable to update RSVP.': 'Не удалось обновить запись.',

  // Leaderboard
  Weekly: 'За неделю',
  'All-Time': 'За всё время',
  'Find member...': 'Найти участника...',
  'Filter leaderboard by nickname': 'Фильтр рейтинга по имени',
  Rank: 'Место',
  'E / M / H': 'Л / С / Т',
  'Weekly XP': 'XP за неделю',
  'No matching members.': 'Нет подходящих участников.',
  You: 'Вы',

  // Profile
  'Sign in to sync streaks, solved challenges, and handles.':
    'Войдите, чтобы синхронизировать серии, решённые задачи и контакты.',
  'admin account': 'аккаунт администратора',
  'learner account': 'аккаунт ученика',
  'Signed in as {email}': 'Вы вошли как {email}',
  'Current Streak': 'Текущая серия',
  Longest: 'Лучшая',
  'Syllabus Completion': 'Завершение программы',
  'Solved Breakdown': 'Разбивка решённых',
  '{total} total': 'всего {total}',
  Easy: 'Лёгкие',
  Medium: 'Средние',
  Hard: 'Сложные',
  'Public profile': 'Публичный профиль',
  'Your display name is the identity shown on the leaderboard and in mentor Q&A.':
    'Ваше имя отображается в рейтинге и вопросах менторам.',
  'Display name': 'Отображаемое имя',
  Username: 'Имя пользователя',
  'GitHub handle': 'Ник GitHub',
  'Telegram handle': 'Ник Telegram',
  '(optional)': '(необязательно)',
  'Save profile': 'Сохранить профиль',
  'Profile updated.': 'Профиль обновлён.',
  'Unable to save profile.': 'Не удалось сохранить профиль.',
  'Admin access unlocked · Compose tab is active':
    'Доступ администратора открыт · вкладка редактора активна',
  'Admin passcode': 'Пароль администратора',
  'Enter admin passcode': 'Введите пароль администратора',
  Passcode: 'Пароль',
  'Checking...': 'Проверка...',
  Verify: 'Проверить',
  Cancel: 'Отмена',
  'Admin composer unlocked.': 'Редактор администратора разблокирован.',
  'Invalid admin passcode.': 'Неверный пароль администратора.',
  'Recent Submissions': 'Последние отправки',
  'No submissions yet.': 'Отправок пока нет.',
  Language: 'Язык',
  Verdict: 'Вердикт',
  Tests: 'Тесты',
  Runtime: 'Время',
  Stack: 'Стек',
  Tags: 'Теги',
  Badges: 'Значки',
  'Completed tracks': 'Завершённые треки',
  'Add up to {count} comma-separated items.': 'Добавьте до {count} элементов через запятую.',
  'e.g. Python, TypeScript, Firestore': 'например, Python, TypeScript, Firestore',
  'e.g. algorithms, backend, interview-prep': 'например, алгоритмы, backend, подготовка к интервью',
  'No badges yet.': 'Значков пока нет.',
  'No completed tracks yet.': 'Завершённых треков пока нет.',
  Contact: 'Контакты',
  'Profile details': 'Данные профиля',

  // Admin composer
  'Admin Composer': 'Редактор администратора',
  'Publish challenges and live workshops.': 'Публикация задач и живых воркшопов.',
  'Sync Starter Curriculum': 'Синхронизировать стартовую программу',
  'Syncing...': 'Синхронизация...',
  'Problem Composer': 'Редактор задач',
  'Workshop Publisher': 'Публикация воркшопов',
  'Member Awards': 'Награды участникам',
  'Starter syllabus tracks, challenges, and workshops synced to Firestore.':
    'Стартовые треки, задачи и воркшопы синхронизированы с Firestore.',
  'Sync failed.': 'Синхронизация не удалась.',
  'Provide a valid problem title or slug.': 'Укажите корректное название или slug задачи.',
  'Published challenge "{title}" ({slug}).': 'Задача "{title}" ({slug}) опубликована.',
  'Unable to save problem.': 'Не удалось сохранить задачу.',
  'Published Workshop {issue}: "{title}".': 'Воркшоп {issue}: "{title}" опубликован.',
  'Unable to publish workshop.': 'Не удалось опубликовать воркшоп.',
  'Challenge title': 'Название задачи',
  'URL slug (auto-generated if blank)': 'URL slug (создаётся автоматически)',
  'Syllabus Track': 'Трек программы',
  'XP Reward (10 - 500)': 'Награда XP (10–500)',
  'Feature as Daily Challenge': 'Сделать задачей дня',
  'Problem statement (Markdown supported)': 'Условие задачи (поддерживается Markdown)',
  'Describe the problem, stdin format, and expected stdout format...':
    'Опишите задачу, формат stdin и ожидаемый stdout...',
  'Official Mentor Editorial': 'Официальный разбор ментора',
  'Explain the key invariant and time/space complexity...':
    'Объясните ключевой инвариант и сложность по времени и памяти...',
  'Think Before You Run Check': 'Проверка «Думай до запуска»',
  'Prediction question (e.g., What does this print?)': 'Вопрос-прогноз (например, что выведет код?)',
  'Short trace snippet...': 'Короткий фрагмент для трассировки...',
  'Explanation shown when verified...': 'Объяснение после проверки...',
  'Test Cases (Sample & Hidden)': 'Тесты (примеры и скрытые)',
  'Add test case': 'Добавить тест',
  'Stdin input': 'Ввод stdin',
  'Expected stdout': 'Ожидаемый stdout',
  Hidden: 'Скрытый',
  'Remove test case': 'Удалить тест',
  'Python starter': 'Стартовый Python',
  'JavaScript starter': 'Стартовый JavaScript',
  'C++ starter': 'Стартовый C++',
  'Publishing...': 'Публикация...',
  'Publish challenge': 'Опубликовать задачу',
  'Issue number': 'Номер выпуска',
  'Workshop title': 'Название воркшопа',
  Summary: 'Описание',
  'Start time (ISO UTC)': 'Время начала (ISO UTC)',
  'Academy timezone label': 'Метка часового пояса академии',
  'Prerequisites...': 'Требования...',
  'Discord / Google Meet URL': 'Ссылка Discord / Google Meet',
  'Slides URL (optional)': 'Ссылка на слайды (необязательно)',
  'Repository URL (optional)': 'Ссылка на репозиторий (необязательно)',
  'Colab Notebook URL (optional)': 'Ссылка на Colab (необязательно)',
  'Problem set URL (optional)': 'Ссылка на набор задач (необязательно)',
  'Replay / video URL (optional)': 'Ссылка на запись / видео (необязательно)',
  'Agenda (one item per line)': 'План (по одному пункту в строке)',
  'Feature as the upcoming live session': 'Сделать ближайшей живой сессией',
  'Publish workshop': 'Опубликовать воркшоп',
  'Mentor or Admin permissions are required to publish problems or workshops.':
    'Для публикации задач и воркшопов нужны права ментора или администратора.',
  'Award XP and badges to members.': 'Назначайте XP и значки участникам.',
  'Find a member...': 'Найти участника...',
  'XP to award': 'XP к начислению',
  'Award XP and badges': 'Начислить XP и значки',
  'Awarded {xp} XP and updated badges for {name}.': 'Начислено {xp} XP и обновлены значки для {name}.',
  'Select a member first.': 'Сначала выберите участника.',
  'Unable to award member.': 'Не удалось наградить участника.',
  'Award XP and badges to an individual member.': 'Начислите XP и значки конкретному участнику.',

  // Member profile modal
  'Close profile': 'Закрыть профиль',
  'Longest streak': 'Лучшая серия',
  'No stack listed.': 'Стек не указан.',
  'No tags listed.': 'Теги не указаны.',
  'Public member profile': 'Публичный профиль участника',
};

interface I18nContextValue {
  language: Language;
  locale: string;
  setLanguage: (language: Language) => void;
  t: (template: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // Ignore storage errors and still update subscribers.
    }
    languageListeners.forEach((cb) => cb());
  }, []);

  const t = useCallback(
    (template: string, vars?: Record<string, string | number>) => {
      const translated = language === 'ru' ? RU[template] ?? template : template;
      return interpolate(translated, vars);
    },
    [language]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      locale: language === 'ru' ? 'ru-RU' : 'en-US',
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return ctx;
}
