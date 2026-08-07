# Внедрение фичей Next.js 16.3: Instant Navigations, Root Params и Caching

После ознакомления со статьей и документацией Next.js 16.3, я подготовил новый, более глубокий архитектурный план. Главная цель — превратить ваше классическое SSR-приложение, которое блокирует рендеринг страницы до завершения загрузки данных, в **быстрое (instant)** приложение с ощущением SPA, используя новую парадигму кэширования и `<Suspense>`.

## Proposed Changes

### 1. Настройка Instant Navigations и Кэширования
В Next.js 16.3 появилась концепция **Cache Components**, которая позволяет строить статическую оболочку (Static Shell) и мгновенно её отображать. Также для оптимизации клиентских переходов мы включим **Partial Prefetching**.

*   **[MODIFY]** [next.config.ts](file:///c:/Users/user/WebstormProjects/interview-app-frontend/next.config.ts)
    *   Включим флаг `cacheComponents: true` для перехода на новую парадигму кэширования и Partial Prerendering (PPR).
    *   Включим флаг `partialPrefetching: true` для загрузки единой статической оболочки (App Shell) на каждый роут, вместо ресурсоемкого prefetch'а каждой отдельной ссылки.

### 2. Рефакторинг SSR на Static Shell + Suspense (Instant Navigations)
Сейчас **все страницы** (например, `questions`, `interviews`, `assessments`, `team` и др.) ожидают завершения `loadAuthGate` и загрузки данных на самом верхнем уровне. Это полностью блокирует рендеринг.

*   **[MODIFY]** Все `page.tsx` в `src/app/[locale]/**`
    *   **Изменение архитектуры:** Мы уберем глобальные `await` (загрузку данных и проверку прав) из корневого компонента `Page`. 
    *   Корневой компонент будет возвращать статический "скелет" страницы (Static Shell) мгновенно.
    *   Загрузка данных (auth и данные списков) будет вынесена в дочерние асинхронные серверные компоненты, которые будут обернуты в `<Suspense fallback={<Skeleton />}>`.
    *   Это позволит всему приложению реагировать на клики мгновенно, показывая UI-оболочку, в то время как данные догружаются (Streaming).

### 3. Внедрение `next/root-params` (Избавление от Prop Drilling)
В Next.js 16.3 появилась возможность получать корневые параметры роута глобально.

*   **[MODIFY]** Все Server Components, которые зависят от `locale`.
    *   Вместо того чтобы принимать `props.params` и делать `const { locale } = await params`, мы будем использовать:
      ```tsx
      import { locale as getLocale } from 'next/root-params'
      const locale = await getLocale()
      ```
    *   Это позволит нам легко получать текущую локаль в глубоко вложенных серверных компонентах (например, при загрузке переводов `getTranslations`) без необходимости прокидывать её через пропсы сверху вниз.

### 4. Новая Аутентификация и Глобальные Ошибки
(Из предыдущего плана, но адаптировано под новую парадигму)

*   **[MODIFY]** [src/lib/auth-gate.ts](file:///c:/Users/user/WebstormProjects/interview-app-frontend/src/lib/auth-gate.ts)
    *   Перейдем на использование встроенных функций `forbidden()` и `unauthorized()`, вместо возврата объекта с состоянием.
*   **[NEW]** `src/app/[locale]/forbidden.tsx` и `src/app/[locale]/unauthorized.tsx`
    *   Создадим глобальные UI-страницы для обработки ошибок доступа.

### 5. Оптимизация кэширования через `"use cache"`
*   **[MODIFY]** API-клиенты и тяжелые запросы.
    *   Заменим старые механизмы кэширования (если они использовались) на директиву `"use cache"`. Для запросов, зависящих от пользователя (cookies/headers), можно рассмотреть `"use cache: private"`.

---

## User Review Required

> [!IMPORTANT]
> **Перенос Data Fetching в Suspense:** Это самое масштабное изменение. Чтобы Instant Navigations работали, страница *не должна* блокироваться запросами на верхнем уровне. Это означает, что логика проверки прав (`loadAuthGate`) и инициализации React Query (`prefetchQuestionsLibrary`) будет смещена ниже по дереву компонентов. 
> 
> **Согласны ли вы на такой рефакторинг UI (добавление `<Suspense>` и скелетонов) для достижения Instant Navigations?**

> [!WARNING]
> Использование `next/root-params` — это новейшая фича 16.3. Убедитесь, что ваш ESLint и TypeScript настроены на актуальные версии Next.js, так как типы для `root-params` генерируются автоматически (командой `next dev` или `next typegen`).

## Open Questions

1. Для создания Static Shell нам понадобятся компоненты-скелетоны (Skeletons) для таблиц/списков вопросов и интервью. Хотите ли вы, чтобы я сверстал базовые скелетоны, или мы можем пока использовать простой текст "Loading..." в качестве fallback для `<Suspense>`?
2. Стоит ли нам добавить библиотеку `@next/playwright` в `package.json` для написания тестов на Instant Navigations, как это рекомендуется в гайде?

## Verification Plan

1. Я внесу изменения в `next.config.ts`.
2. Отрефакторю `questions/page.tsx` с использованием `Suspense`, `next/root-params` и перенесу проверку аутентификации в дочерний компонент (или middleware/layouts, где это уместнее для shell).
3. Добавлю `forbidden.tsx`.
4. В dev-режиме (используя Next.js DevTools / Navigation Inspector) вы сможете увидеть, как страница мгновенно отдает Loading Shell без ожидания сервера.
