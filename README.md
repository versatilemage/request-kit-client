# 🚀 Request Kit Client

A flexible, TypeScript-first API client SDK that simplifies data fetching and HTTP service structure in modern frontend applications.

**🌐 [View Landing Page](https://request-kit-client-landing-datk.vercel.app/)**

Designed to reduce API boilerplate, improve maintainability, and support robust token and error handling in both client and server-side applications.

---

## ✨ Features

* ✅ **Plug-and-play API client**
* 🔐 **Token injection** with Axios interceptors
* 🧱 **Modular services** (auth, user, etc.)
* 🧠 **Centralized error normalization**
* 🗖️ **Auto Content-Type** for JSON/FormData
* 🔧 **Dynamic custom service creation with type safety**
* 💪 **Strong TypeScript typings with inference**
* 🛡️ **401/403 Unauthorized interception support**
* 🌍 **SSR & Public API compatible**
* 🚀 **Composable with route overrides & reusable service factories**
* 🗶️ **Built-in GET response caching (TTL-based)**
* 🌟 **Method-specific request/response typing**
* 🧱 **Partial service definitions for flexible extension**
* ✏️ **Response transformation hooks per method**
* ⚙️ **Global header injection**
* ⛔ **Configurable service disabling**
* 🔄 **Global error handling hook**

---

## 🧱 Use Cases

* ✅ Build modular auth/user services with custom routes or defaults
* ✅ Generate lightweight API SDKs with endpoint-level control
* ✅ Create reusable API definitions across frontend apps
* ✅ Drop-in support for SSR and browser apps with token handling
* ✅ Customize request/response logic with transform hooks
* ✅ Auto-typed service factories for any RESTful APIs
* ✅ Override routes dynamically and merge with defaults
* ✅ Inject custom headers globally and per request
* ✅ Enable/disable services dynamically (auth/user)
* ✅ Handle 401s and global errors gracefully

---

## 🕖 Installation

```bash
npm install request-kit-client
```

---

## 🚦 Getting Started

### 1. Create an API Client

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
  disable: {
    user: false,
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

### 4. Custom Services (Typed)

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

## 🔁 Caching Support

GET requests support TTL-based caching:

```ts
const { data } = await api.user?.getProfile({ cacheTTL: 300000 }); // 5 mins
```

---

## 🧠 Response Transformation (per endpoint)

Each service method supports a `transformResponse` hook:

```ts
const userService = createUserService(http, {
  getProfile: {
    method: "get",
    endpoint: "/user/me",
    responseType: {} as UserProfile,
    transformResponse: (data) => ({ ...data, fullName: data.name + " (user)" }),
  },
});

const { data } = await userService.getProfile(); // data.fullName = "Jane Doe (user)"
```

---

## 🛡️ Token Injection

Tokens are injected automatically via `getToken()`:

```ts
createApiClient({
  getToken: () => localStorage.getItem("auth_token"),
});
```

---

## 💥 Global Error Handling

Catch errors globally for analytics or fallback UI:

```ts
createApiClient({
  onError: (err) => {
    console.error("Global HTTP Error:", err);
    // Track/log/etc
  },
});
```

---

## 🔄 Low-level HTTP Fallback

```ts
const { data, error } = await api.http.get<MyType>("/weather/today");
```

---

## 🧼 Unified Error Shape

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

## 🧰 Route Overrides & Partial Merging

Override only specific fields like `endpoint` and merge with default values:

```ts
const api = createApiClient({
  routeOverrides: {
    auth: {
      login: {
        endpoint: "/v2/custom-login",
      },
    },
  },
});
```

---

## 📁 Folder Structure

```
src/
├── http/           # Axios wrapper
├── services/       # Service factories (auth, user, custom)
├── utils/          # Error, cache, helpers
├── types/          # API types
├── routes/         # Default routes
└── index.ts        # SDK entrypoint

tests/
├── service/        # Service tests
├── utils/          # Utility tests
└── mock/           # Shared mocks
```

---

## 🛠️ Roadmap

### ✅ Completed

* Core API client with Axios
* Auth and User service generators
* GET caching with TTL support
* Route override support
* SSR-friendly token resolver
* Response transformation hooks
* Error normalization
* Typed custom service builder
* Disable built-in services
* Global headers and onError handler

### 🧪 In Progress

* Typed test coverage for service factories
* Edge case handling for optional request bodies

### 🕒 Planned

* Retry and timeout support
* OAuth2 support
* Two-Factor Auth (2FA)
* CLI for service codegen
* React Query/Hook integration
* Middleware hooks (onError, on401)
* Request deduplication for GETs
* RBAC & Permission system integration

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
