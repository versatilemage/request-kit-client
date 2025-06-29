# 🚀 Request Kit Client

A powerful, TypeScript-first API client SDK for authentication, user profile management, and custom HTTP services — built with Axios and clean developer ergonomics.

**🌐 [View Landing Page](https://request-kit-client-landing-datk.vercel.app/)**

Ideal for any frontend app that needs:

* Modular API services (auth, user, etc.)
* Token injection
* Type-safe request and response handling
* Custom service definitions
* Built-in caching and error normalization

---

## ✨ Features

* ✅ **Plug-and-play API client**
* 🔐 **Token injection** via Axios interceptors
* 🧱 **Modular services** (auth, user, etc.)
* 🦼 **Auto Content-Type** for JSON and FormData
* 🧠 **Centralized error normalization**
* 📦 **Optional response caching**
* 🔧 **Dynamic custom service creation**
* 💪 **Full TypeScript support**
* ⚡ **Custom route overrides**
* 🌍 **Composable and extendable for all APIs**
* 🛡️ **Unauthorized handler support via `onUnauthorized`**
* 🌐 **SSR & Public/Private API compatibility**
* 🧹 **Custom error handling (planned)**
* 🔁 **Retry & timeout support (planned)**

---

## 🗖 Installation

```bash
npm install request-kit-client
```

---

## 🔧 Quick Start

### 1. Create an API Client

```ts
import { createApiClient } from "request-kit-client";

const api = createApiClient({
  baseUrl: "https://api.example.com",
  getToken: () => localStorage.getItem("auth_token"),
  routeOverrides: {
    auth: {
      login: "/v2/auth/login",
    },
    user: {
      profile: "/me",
    },
  },
  onUnauthorized: (status) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
  },
});
```

---

### 2. Authentication

```ts
const { data, error } = await api.auth.login({ email, password });

if (data) {
  localStorage.setItem("auth_token", data.token);
} else {
  console.error("Login failed:", error?.message);
}

await api.auth.logout();
```

---

### 3. User Profile

```ts
// Get current user
const { data: user, error } = await api.user.getProfile();

// Update profile
await api.user.updateProfile({ name: "Jane Doe" });
```

---

### 4. Custom API Calls

Use `createCustomService()` to define your own services:

```ts
import { createCustomService } from "request-kit-client";

const weatherService = createCustomService(api.http, {
  getWeather: {
    method: "get",
    endpoint: (city: string) => `/weather/today?city=${city}`,
  },
  postLog: {
    method: "post",
    endpoint: "/weather/logs",
  },
});

const { data } = await weatherService.getWeather("New York");
```

---

### 5. Response Caching (GET only)

```ts
const { data } = await api.user.getProfile({ cacheTTL: 300000 }); // 5 mins
```

---

## 🔐 Token Handling

Tokens are injected via the `Authorization: Bearer <token>` header automatically.

Provide a `getToken` method to control the logic:

```ts
getToken: () => {
  const token = localStorage.getItem("auth_token");
  return token;
}
```

---

## ⚡ Unauthorized Handler (401/403)

Use the `onUnauthorized` hook to define custom behavior for 401/403 responses:

```ts
const api = createApiClient({
  baseUrl: "https://api.example.com",
  getToken: () => localStorage.getItem("auth_token"),
  onUnauthorized: (status) => {
    if (status === 401 || status === 403) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
  },
});
```

This provides **fine-grained control** and replaces hardcoded logic.

---

## ⚙️ SSR & Public API Compatibility

You can use this client in SSR frameworks like **Next.js**:

```ts
createApiClient({
  getToken: (ctx) => {
    if (typeof window === "undefined") {
      return ctx?.req?.cookies?.token ?? null;
    }
    return localStorage.getItem("auth_token");
  }
});
```

Also works without tokens for public endpoints — just omit `getToken`.

---

## 🛠️ Advanced

### Route Overrides

Override any route by supplying custom paths:

```ts
routeOverrides: {
  user: {
    profile: "/me",
  },
}
```

### Low-Level HTTP Access

Use direct HTTP methods when needed:

```ts
const { data, error } = await api.http.get<MyType>("/weather/today");
```

---

## 🔁 Retry & Timeout (Planned)

Planned support for:

* Per-request timeout configuration
* Automatic retries with backoff
* Axios instance injection

---

## 📦 API Client Options

```ts
createApiClient({
  baseUrl: string;                        // Required
  getToken?: () => string | null;        // Optional
  onUnauthorized?: (status: number) => void; // Optional
  routeOverrides?: Partial<ApiRoutes>;   // Optional
});
```

---

## 🧪 Return Shape

Every API call returns:

```ts
{
  data: T | null;
  error: {
    message: string;
    statusCode?: number;
    isNetworkError?: boolean;
    raw?: any;
  } | null;
}
```

✅ Always either `data` or `error` — never both.

---

## 📚 Service Methods

### Auth

| Method    | Description             |
| --------- | ----------------------- |
| login()   | Log in with credentials |
| logout()  | Log out current user    |
| refresh() | Refresh auth token      |

### User

| Method          | Description         |
| --------------- | ------------------- |
| getProfile()    | Fetch current user  |
| updateProfile() | Update profile data |

### Custom

Define any endpoints using `createCustomService()`:

```ts
const service = createCustomService(api.http, {
  getItem: {
    method: "get",
    endpoint: (id: string) => `/items/${id}`,
  },
});
```

---

## 🧠 Utilities

### Custom Service Definition

```ts
const customService = createCustomService(api.http, {
  getSomething: {
    method: "get",
    endpoint: "/something",
  },
});
```

### Typed Support

```ts
import type {
  ApiRoutes,
  LoginRequest,
  LoginResponse,
  UserProfile,
  NormalizedError,
} from "request-kit-client";
```

---

## 📁 Folder Structure

```
src/
├── http/           // axios client + wrappers
├── services/       // auth, user, custom service builder
├── utils/          // caching, error normalization
├── types/          // request/response types
├── routes/         // route mappings
└── index.ts        // exposed entrypoint

tests/
├── http/           // tests for http layer
├── service/        // tests for service layer
├── utils/          // tests for utility functions
└── mock/           // reusable mocks
```

---

## 🚧 Roadmap

* [x] Basic auth + user services
* [x] Custom route overrides
* [x] Custom dynamic API support
* [x] Caching for GET
* [x] SSR + token-less API support
* [x] 401/403 handling via `onUnauthorized`
* [ ] OAuth2 support
* [ ] Two-Factor Auth (2FA)
* [ ] Retry & timeout support
* [ ] Middleware hooks (onError, on401)
* [ ] CLI for service codegen
* [ ] React Query/Hook integration

---

## 🧪 Local Development

```bash
npm run dev      # Start in dev mode
npm run build    # Build package
npm run test     # Run tests once
npm run test:watch  # Watch mode
npm publish      # Publish to npm
```

---

## 📜 License

MIT © [Mohammed Syed Awadh](https://github.com/versatilemage)

---

## 🙌 Contributing

Open issues, fork the repo, and submit PRs to help improve this SDK.

---

## ❤️ Why Use This?

Request Kit Client helps frontend developers:

* Remove repetitive API boilerplate
* Handle tokens & errors automatically
* Extend easily with custom logic
* Work confidently with TypeScript

Use it in your SaaS apps, internal tools, admin dashboards, or production-ready SPAs.