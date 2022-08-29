# meatballs.live-stream (STREAM SERVER; kodama)

## How to run it locally

### Prerequisites

- [Git](https://git-scm.com/downloads) 2.37.2
- [Node](https://nodejs.org/download/release/v16.5.0/) 16.50.0
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) 1.22.19

Assuming that you've arrived here from the [meatballs.live (APP) local installation guide](https://github.com/ritsuke/meatballs.live/blob/main/README.md)...

### Local installation

1. Clone this repo
2. Run `yarn` in the project folder to install dependencies
3. Copy `.env.sample` to `.env` and fill in your unique values, following the steps below:

`PORT`

1. Enter the port you would like the STREAM SERVER to use during development

`REDIS_DB_URL`

1. This should mirror the value used by the meatballs.live (APP) development environment

### Continue meatballs.live (APP) installation

Run `yarn dev` to start the development server, though it will be quiet until the APP and JOBS SERVER are running.

Copy the `PORT` value from your `.env` file and continue with the [APP's local installation guide](https://github.com/ritsuke/meatballs.live/blob/main/README.md).

## Deployment

Though meatballs uses [Railway](https://railway.app) to automatically deploy the STREAM SERVER (kodama), you can run the server on any host that is node.js-capable.
