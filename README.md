# Typerace T3 App

Typerace application using the t3 stack.

## Features

- Create game
- Join game
- Share game links
- See other players typing in keyboard form
- See other players word progression percentage
- Words per minute scoreboard

## Tech Stack

### Frontend

- Nextjs
- Typescript
- Tailwind css
- Zustand
- Pusher-js

### Backend

- Trpc
- Typescript
- Mongodb
- Pusher

### Devops

- Docker
- Docker compose
- Github Actions

## Installation

Use the env.example file to know which variable is needed from firebase.

```bash
cp .env.example .env
```

```bash
pnpm i && pnpm dev
```

App runs by default at http://localhost:3030

## Helpers

Install lazydocker on your system. This tool can help visualise container logs.

## License

[MIT](https://choosealicense.com/licenses/mit/)
