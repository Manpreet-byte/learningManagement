# Learning Management System Backend Setup

This project is the initial backend setup for a Learning Management System using Node.js, Express, and MongoDB.

## Folder Structure

```text
learningManagementSystem/
├── config/
│   └── db.js
├── controllers/
├── middleware/
│   └── logger.js
├── models/
├── routes/
│   └── testRoutes.js
├── app.js
├── server.js
├── .env
└── package.json
```

## Setup Guide

1. Install dependencies:

```bash
npm install
```

2. Start the server in development mode:

```bash
npm run dev
```

3. Start the server in production mode:

```bash
npm start
```

## Basic API Check

- `GET /api/test`

This route confirms that the API is running correctly.
