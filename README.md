# WunderGraph Realtime Chat with Server Side Rendering (SSR) & Authentication

WunderGraph Realtime Chat Example using NextJS, TypeScript & PostgreSQL

Do you also hate applications that do complex login flows, loading spinners, etc. before allowing you into their app?
Here's a simple solution how we can deliver a much better user experience while keeping the developer experience simple.

This example demonstrates how you can easily build a NextJS application with Server Side Rendering (SSR) and Realtime subscriptions in the client.

When the user is authenticated, the initial page will be rendered server side.
Once the client is initialized, it will start a realtime subscription to keep the UI updated.

The example consists of two components, the NextJS service as well as the headless API service.
The headless API service handles authentication and API requests.
Once authenticated, a cookie is set by the API service.
Both NextJS application and headless API service run on the same root domain.

This allows us to "forward" the cookie header from the initial client request from the NextJS `getServerSideProps` method to the headless API service.

The code that might interest you the most can be found in [index.tsx](./pages/index.tsx)

## Features

Features:
- Authentication
- Authorization
- Server Side Rendering
- Realtime Updates
- Cross Tab Login/Logout
- Typesafe generated Typescript Client

## Prerequisites

Make sure you have [docker compose](https://docs.docker.com/compose/install/) and [pnpm](https://pnpm.io/de/installation) installed.
Docker is used to bootstrap the database and pnpm to work with multiple npm packages as a workspace.

## Getting Started

This command will provision a database and start all required components to run the demo.
After few seconds your browser will open the application.

```shell
pnpm run dev
```

## Cleanup

```shell
pnpm run cleanup
```

## Questions?

Read the [Docs](https://wundergraph.com/docs).

Join us on [Discord](https://wundergraph.com/discord)!