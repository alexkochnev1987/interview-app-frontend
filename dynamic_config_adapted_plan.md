# Адаптированный план внедрения Dynamic Application Configuration Manager

Этот документ представляет собой адаптированную версию исходного технического задания под архитектурные стандарты и правила репозитория `interview-app-frontend` (согласно [AGENTS.md](file:///C:/Users/user/WebstormProjects/interview-app-frontend/AGENTS.md), [DOCUMENTATION.md](file:///C:/Users/user/WebstormProjects/interview-app-frontend/DOCUMENTATION.md) и [UI_PRIMITIVES_GUIDE.md](file:///C:/Users/user/WebstormProjects/interview-app-frontend/UI_PRIMITIVES_GUIDE.md)).

---

## ⚙️ Утвержденная конфигурация интеграции

* **Страница дашборда суперадмина:** `src/app/[locale]/config/page.tsx`
* **Базовый путь к API эндпоинтам:** `/api/config` и `/api/config/public`
* **Обработка `DISABLE_USER_REGISTRATION`:** Исключена из объема текущей задачи по решению пользователя.

---

## 🏗️ Ключевые архитектурные адаптации

### 1. Серверные компоненты (App Router & SSR Rules)
* **Правило:** *Initial data fetching must happen on the server whenever the data can be loaded during render.*
* **Адаптация:** Вместо отправки клиентского запроса `GET /api/config/public` при монтировании в `useEffect` внутри `AppConfigProvider`, первоначальное получение публичных настроек выполняется на стороне сервера внутри корневого лейаута [src/app/[locale]/layout.tsx](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/app/%5Blocale%5D/layout.tsx) (или в серверном хелпере `src/lib/config-server.ts`).
* Полученный снимок настроек передается в провайдер как `initialConfig`: `<AppConfigProvider initialConfig={...}>`. Клиентский метод `refreshConfig()` используется только для фонового обновления снимка.

### 2. Инкапсуляция UI и стилизация
* **Правило:** *Raw Tailwind utility classes belong only in `src/components/ui/**`.*
* **Адаптация:** В компонентах страниц и фич запрещено использование утилит (`flex`, `grid`, `gap`, `p-*`, `m-*`, `bg-*`, `text-*` и др.).
* Для построения сетки и элементов управления дашборда суперадмина применяются layout-примитивы: [Stack](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/components/ui/layout/stack.tsx), [Inline](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/components/ui/layout/inline.tsx), [Grid](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/components/ui/layout/grid.tsx), [Container](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/components/ui/layout/container.tsx), [PageShell](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/components/ui/layout/page-shell.tsx).
* Элементы интерфейса (таблица, бейджи типов, кнопки) переиспользуются из `src/components/ui/**` (например, [Table](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/components/ui/table.tsx), [Badge / EyebrowBadge / IconBadge](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/components/ui/eyebrow-badge.tsx)).

### 3. Политика обратной связи (Alert vs toast)
* **Правило из DOCUMENTATION.md:**
  * Сохраняемые или требующие действия состояния страницы → инлайн [Alert](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/components/ui/alert.tsx).
  * Действия пользователя → Sonner `toast` исключительно после `await` / `runMutation` из [src/lib/run-mutation.ts](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/lib/run-mutation.ts) (не в `useEffect`).
  * Пассивные ошибки загрузки (например, сбой получения переменных) → `EmptyState` с кнопкой *Retry* без дублирующего тоста.
* **Адаптация:** Режим техобслуживания реализуется через [Alert](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/components/ui/alert.tsx). Кнопки сохранения, добавления и сброса настроек в панели админа используют `runMutation` + `toast`.

### 4. Ограничения демо-режима (Demo read-only gating)
* **Правило:** *In-place write controls on a browsable screen wrap their Button in `DemoWriteGuard`.*
* **Адаптация:** Дашборд управления конфигурацией является browsable экраном. Кнопки «Edit», «Reset» и «Add» будут обернуты в [DemoWriteGuard](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/components/demo/demo-write-guard.tsx), что блокирует их для демо-пользователей и показывает соответствующую подсказку при наведении.

### 5. Локализация (i18n)
* **Правило:** *Используется только модульный формат в `messages/<locale>/*.json`.*
* **Адаптация:** Никаких жестко закодированных английских текстов (ошибки 403, баннер техобслуживания, лейблы в панели управления). Все новые ключи будут синхронизированы для локалей `en`, `be`, `ru`, `pl` с обязательной проверкой `npm run i18n:check`.

---

## 📋 Пошаговый план реализации

### Шаг 1: Контекст конфигурации (`AppConfigProvider` & `useAppConfig`)
- [ ] **Типизация и API-хелперы:**
  - Создать интерфейс `PublicAppConfig` в `src/lib/app-config-types.ts`.
  - Добавить методы в [src/lib/api.ts](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/lib/api.ts):
    - `getPublicConfig()` -> `GET /api/config/public`
    - `getSystemConfigs()` -> `GET /api/config`
    - `updateSystemConfig()` -> `PUT /api/config/:key`
    - `deleteSystemConfig()` -> `DELETE /api/config/:key`
- [ ] **Серверная загрузка снимка:**
  - Реализовать функцию `getServerConfigSnapshot()` в `src/lib/config-server.ts`.
  - В корневом лейауте [src/app/[locale]/layout.tsx](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/app/%5Blocale%5D/layout.tsx) получить начальный конфиг на стороне сервера.
- [ ] **Клиентский провайдер и хуки:**
  - Создать `src/lib/app-config-context.tsx`, экспортирующий `<AppConfigProvider initialConfig={...}>`, `useAppConfig()` и `useRefreshAppConfig()`.
  - Внедрить провайдер в [src/app/[locale]/layout.tsx](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/app/%5Blocale%5D/layout.tsx).

---

### Шаг 2: "Scenario A" в видеозаписи интервью (Candidate Interview Recorder)
- [ ] **Адаптация оркестратора:**
  - Отредактировать хук [src/features/take/use-take-orchestrator.ts](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/features/take/use-take-orchestrator.ts) и модуль `src/features/take/attempt-limit.ts`.
  - Заменить жестко закодированные константы `TAKE_RECORDING_LIMIT_SECONDS` и `MAX_ANSWER_ATTEMPTS_PER_QUESTION` на значения из `useAppConfig()`.
- [ ] **Паттерн снимка (Snapshot Pattern):**
  - При монтировании нового вопроса фиксировать локальное состояние таймера и количества попыток из текущего контекста конфигурации.
  - При переходе к следующему вопросу («Next Question») вызывать `await refreshConfig()` **до** инициализации состояния следующего вопроса.
  - **Критический инвариант:** Не менять таймер текущей записи при внешнем обновлении конфигурации; изменения вступают в силу только при переходе к вопросу N+1.

---

### Шаг 3: Динамические переключатели функций (UI Feature Toggles)
- [ ] **Google OAuth Button:**
  - В [src/components/login/login-form.tsx](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/components/login/login-form.tsx) обернуть кнопку авторизации через Google в проверку `{config.ENABLE_GOOGLE_OAUTH && ...}`.
- [ ] **Feedback Share Buttons:**
  - В [src/components/candidate-feedback/candidate-feedback-share-panel.tsx](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/components/candidate-feedback/candidate-feedback-share-panel.tsx) скрывать элементы генерации и копирования ссылки, если `config.ENABLE_FEEDBACK_SHARE_LINKS` равен `false`.
- [ ] **Emergency Maintenance Banner (Killswitch):**
  - Создать компонент `MaintenanceModeOverlay` в `src/components/app/maintenance-mode-overlay.tsx`.
  - Внедрить его в [src/app/[locale]/layout.tsx](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/app/%5Blocale%5D/layout.tsx) (рядом с `<DemoModeBanner />`). Если `config.MAINTENANCE_MODE_KILLSWITCH === true`, отображать полноэкранный блок или глобальный предупреждающий баннер.

---

### Шаг 4: Дашборд управления конфигурацией для Суперадмина
- [ ] **Роутинг и боковое меню:**
  - Создать страницу `src/app/[locale]/config/page.tsx`.
  - Добавить ссылку в [src/app/[locale]/side-nav.tsx](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/app/%5Blocale%5D/side-nav.tsx) с проверкой роли: `isSuperAdmin(user?.role)` из [src/lib/auth-roles.ts](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/lib/auth-roles.ts).
- [ ] **Защита маршрута (Role Guards):**
  - При отсутствии роли `super_admin` отображать `FlashErrorPageFallback` с ошибкой 403 / выполнять редирект.
- [ ] **Таблица конфигурации (Data Table):**
  - Отрисовывать список переменных с применением компонента [Table](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/components/ui/table.tsx).
  - **Ключ и описание:** `UPPER_SNAKE_CASE` жирным шрифтом, описание ниже (через [Stack](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/components/ui/layout/stack.tsx)).
  - **Бейджи типов и теги:** Переиспользовать `EyebrowBadge` / `IconBadge` с соответствующими цветовыми схемами (`tone`) для типов (`string`, `number`, `boolean`, `json`, `secret`) и статуса 🌐 `Public`.
  - **Маскирование секретов:** Для `is_secret === true` отображать `••••••••••••` и скрывать исходные данные.
- [ ] **Элементы управления (с Demo-оберткой):**
  - Все кнопки (*Edit*, *Reset*, *Quick Add*) оборачивать в [DemoWriteGuard](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/components/demo/demo-write-guard.tsx).
  - Реализовать отправку изменений через модальное окно и API-клиент (используя `runMutation` из [src/lib/run-mutation.ts](file:///C:/Users/user/WebstormProjects/interview-app-frontend/src/lib/run-mutation.ts) и обратную связь через `toast`).

---

## 🧪 План верификации и приемки (Acceptance Criteria)

1. **Проверка таймера кандидата:** Изменение `MAX_ANSWER_DURATION_SECONDS` во время записи вопроса 1 не прерывает и не сбрасывает таймер текущей попытки. Вопрос 2 при переходе гарантированно подхватывает новое значение таймера.
2. **Маскирование секретов:** UI админки корректно работает с маскированными значениями (`"********"`) от бэкенда и не вызывает ошибок рендеринга.
3. **Защита ролей:** Доступ к панели конфигурации по адресу `/config` под ролями `admin`, `hr`, `candidate` (или анонимно) запрещается (403 / редирект).
4. **Соблюдение UI Encapsulation & Demo Guard:** Никаких сырых классов Tailwind в новых файлах страниц/фич; в режиме демо все кнопки изменения настроек корректно блокируются подсказкой `DemoWriteGuard`.
5. **Тестирование локализации:** Прогон скрипта `npm run i18n:check` завершается без ошибок.
