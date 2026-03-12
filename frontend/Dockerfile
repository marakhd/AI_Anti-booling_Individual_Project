FROM oven/bun:latest AS build

WORKDIR /opt/frontend

COPY package.json bun.lock ./

RUN bun install

COPY . .

RUN bun run build

FROM oven/bun:latest

WORKDIR /opt/frontend

# Копируем зависимости и билд из первого этапа
COPY --from=build /opt/frontend/.next ./.next
COPY --from=build /opt/frontend/public ./public
COPY --from=build /opt/frontend/node_modules ./node_modules
COPY --from=build /opt/frontend/package.json ./

# Открываем порт
EXPOSE 3000

# Запускаем Next.js приложение
CMD ["bun", "run", "start"]