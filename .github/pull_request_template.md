## Título do PR

chore(tailwind): migrar para v4 e corrigir estilos

## Descrição

- Explique brevemente o que mudou e por quê.
- Contextualize o problema (estilos não aplicando após upgrade) e a solução.

## Alterações principais

- Atualiza entrada do Tailwind para sintaxe v4 em `src/index.css`:
  - `@import "tailwindcss"` (primeiro)
  - `@config "../tailwind.config.js"`
  - `@source "../index.html" "../src/**/*.{js,ts,jsx,tsx}"`
- Mantém `tailwind.config.js` minimal e compatível (darkMode: "class").
- Garante ordem correta das diretivas PostCSS para não quebrar o build.

## Como testar

1. Instalar dependências (se necessário): `npm ci`
2. Rodar em desenvolvimento: `npm run dev`
   - Validar tema claro/escuro via `ThemeToggle` (classe `dark` no `<html>`)
   - Verificar utilitários aplicados em `App.tsx` (cores, spacing, grid)
3. Build de produção: `npm run build`
   - Conferir que `dist/assets/*.css` contém utilitários Tailwind v4
4. (Opcional) `npm run preview` para checagem final

## Evidências (screenshots/opcional)

- Antes/Depois (se aplicável)

## Checklist

- [ ] Build local ok (`npm run build`)
- [ ] Preview ok (`npm run preview`)
- [ ] Lint ok (`npm run lint`)
- [ ] Testes manuais de tema claro/escuro
- [ ] Sem breaking changes aparentes
- [ ] Documentação atualizada (se necessário)

## Checklist específico Tailwind v4

- [ ] `@import "tailwindcss"` vem antes de outras diretivas
- [ ] `@source` cobre `index.html` e `src/**/*.{ts,tsx,js,jsx}`
- [ ] `tailwind.config.js` não conflita com v4 (opcional, mantido)
- [ ] Classes utilitárias obsoletas não utilizadas

## Tipo de mudança

- [ ] Bug fix
- [x] Chore/Build
- [ ] Refactor
- [ ] Feature

## Riscos e mitigação

- Risco: cache do navegador mascarar CSS antigo → Mitigar com hard refresh/limpar cache.
- Risco: classes dinâmicas não detectadas → Mitigar garantindo strings literais ou safelist (se necessário).

## Issues relacionadas

Closes #

## Passos de rollback

- Reverter `src/index.css` para diretivas anteriores e remover `@source`.

