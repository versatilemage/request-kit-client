# 🚀 Request Kit Client

A flexible, **TypeScript-first API client SDK** that simplifies data fetching and service structure in modern frontend applications.

**🌐 [View Landing Page](https://request-kit-client-landing.vercel.app/)**

Designed to **reduce API boilerplate**, improve maintainability, and support **robust token, error, and file upload handling** in both client and server-side apps.

---

## ✨ Features

* ✅ **Plug-and-play API client** (`createApiClient`)
* 🔐 **Token injection** with Axios interceptors or `fetch`
* 🧱 **Built-in modular services** (Auth, User, etc.)
* 🔧 **Dynamic custom service creation** with **full type safety**
* 🧠 **Centralized error normalization** → always predictable error shape
* 🗖 **Auto Content-Type handling** (JSON, FormData, text, raw)
* 📂 **Multipart form-data support** (file uploads, FormData auto-detection)
* 💪 **Strong TypeScript typings with inference** (req/res typing per method)
* 🛡 **401/403 Unauthorized interception** with global hooks
* 🌍 **SSR & Public API compatible** (token resolvers for server & client)
* 🚀 **Composable service factories** with **route overrides**
* 🗶 **Built-in GET response caching (TTL-based)**
* ✏️ **Response transformation hooks** per endpoint
* ⚙️ **Global header injection + global error handler**
* ⛔ **Configurable service disabling** (disable auth/user when not needed)
* 🔄 **Low-level HTTP fallback** (`api.http.get/post/...`)
* 🔗 **Native query parameter support** for all HTTP methods

---

## 🧱 Use Cases

* ✅ Build modular **Auth/User services** with custom or default routes
* ✅ Generate lightweight, **typed API SDKs** with endpoint-level control
* ✅ Drop-in for **SSR + browser apps** with token handling
* ✅ Override routes dynamically & merge with defaults
* ✅ Inject headers globally (multi-tenant apps, API keys, etc.)
* ✅ File upload / multipart form-data support
* ✅ Catch and normalize errors for analytics or fallback UI
* ✅ Query parameters for filtering, pagination, and API options

---

## 🕖 Installation

```bash
npm install request-kit-client
```

---

## 🚦 Getting Started

### 1. Create an API Client (Axios-powered)

```ts
import { createApiClient } from "request-kit-client";

const api = createApiClient({
  baseUrl: "https://api.example.com",
  getToken: () => localStorage.getItem("auth_token"),
  headers: { "x-app-id": "frontend" },
  onUnauthorized: (status) => {
    if ([401, 403].includes(status)) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
  },
  onError: (err) => {
    console.error("Global API Error:", err);
  },
  features: {
    loginVia: "both",
    enable2FA: true,
  },
});
```

---

### 2. Auth Service (Built-in)

```ts
const { data, error } = await api.auth?.login({ email, password });

if (data) localStorage.setItem("auth_token", data.token);

await api.auth?.logout();
```

---

### 3. User Service (Built-in)

```ts
// Get profile
const { data: user } = await api.user?.getProfile();

// Update profile
await api.user?.updateProfile({ name: "Jane Doe" });
```

---

### 4. Custom Service (Typed + Extendable)

```ts
import { createCustomService } from "request-kit-client";

const productService = createCustomService(api.http, {
  getProduct: {
    method: "get",
    endpoint: (id: string) => `/products/${id}`,
    responseType: {} as Product,
  },
  createProduct: {
    method: "post",
    endpoint: "/products",
    requestType: {} as ProductInput,
    responseType: {} as { id: string },
  },
});

const { data } = await productService.getProduct("123");
```

---

### 5. File Uploads (FormData / Multipart)

```ts
const fd = new FormData();
fd.append("file", fileInput.files[0]);
fd.append("meta", JSON.stringify({ uploadedBy: "admin" }));

const { data, error } = await api.http.post<{ url: string }>("/upload", fd);

if (error) console.error("Upload failed", error);
else console.log("File uploaded at", data?.url);
```

> `FormData` is auto-detected — no need to manually set `Content-Type`.

---

## 🔁 Caching Support

```ts
// Cache GET for 5 minutes
const { data } = await api.user?.getProfile({ cacheTTL: 300000 });
```

---

## 🔗 Query Parameters

Native support for query parameters across all HTTP methods:

```ts
// GET with query params
const { data } = await api.http.get<User[]>("/users", {
  params: { page: 1, limit: 10, active: true },
  cacheTTL: 300000, // Cache key includes query params
});

// POST with query params
const { data } = await api.http.post<User>("/users", { name: "John" }, {
  params: { filter: "active" },
});

// PUT with query params
const { data } = await api.http.put<User>("/users/123", { name: "Jane" }, {
  params: { version: 2 },
});

// DELETE with query params
const { data } = await api.http.delete<{ deleted: boolean }>("/users/123", undefined, {
  params: { force: true },
});
```

**Features:**
* ✅ Type-safe query parameters (`string | number | boolean`)
* ✅ Automatic null/undefined filtering
* ✅ Cache-aware (different params = different cache entries)
* ✅ Works with both Axios and Fetch implementations
* ✅ SSR-compatible

> **Note:** Query parameters are automatically included in cache keys, so `/users?page=1` and `/users?page=2` are cached separately.

---

## 🧠 Response Transformation

```ts
const userService = createCustomService(api.http, {
  getProfile: {
    method: "get",
    endpoint: "/user/me",
    responseType: {} as UserProfile,
    transformResponse: (data) => ({
      ...data,
      fullName: data.name + " (user)",
    }),
  },
});

const { data } = await userService.getProfile();
console.log(data?.fullName); // "Jane Doe (user)"
```

---

## 🛡️ Error Handling

All responses have a **unified shape**:

```ts
{
  data: T | null,
  error: {
    message: string;
    statusCode?: number;
    isNetworkError?: boolean;
    raw?: any;
  } | null
}
```

Global error hook:

```ts
createApiClient({
  onError: (err) => {
    console.error("Global HTTP Error:", err);
    // Track/log/etc
  },
});
```

---

## ⚙️ SSR Support

```ts
getToken: (ctx) => {
  if (typeof window === "undefined") {
    return ctx?.req?.cookies?.auth_token;
  }
  return localStorage.getItem("auth_token");
},
```

---

## 📁 Folder Structure

```
src/
├── http/           # Axios + Fetch wrappers
├── services/       # Service factories (auth, user, custom)
├── utils/          # Error, cache, helpers
├── types/          # API types
└── index.ts        # SDK entrypoint

tests/
├── services/       # Service tests
├── utils/          # Utility tests
└── mocks/          # Shared mocks
```

---

## 🛠️ Roadmap

### ✅ Completed

* Core API client (Axios + Fetch)
* Auth and User service generators
* FormData / multipart uploads
* GET caching (TTL-based)
* Route overrides
* SSR-friendly token resolver
* Response transformation hooks
* Error normalization
* Typed custom service builder
* Disable built-in services
* Global headers & error hooks
* Native query parameter support

### 🧪 In Progress

* Test coverage for service factories
* Edge cases for optional request bodies

### 🕒 Planned

* Retry & timeout support
* OAuth2 support
* Two-Factor Auth (2FA)
* CLI for service codegen
* React Query/Hook integration
* Request deduplication
* RBAC/permission integration

---

## 📜 License

MIT © [Mohammed Syed Awadh](https://github.com/versatilemage)

---

## 🙌 Contributing

1. Fork the repo
2. Run tests: `npm run test`
3. Submit PRs with improvements or fixes

---

## ❤️ Why Request Kit Client?

> A modern API SDK made for DX — empowering frontend developers to ship clean, reliable, and scalable apps without boilerplate.

* Clean abstractions with full control
* Zero-runtime custom services
* Typed and ergonomic
* Ideal for SaaS, admin dashboards, internal tools
