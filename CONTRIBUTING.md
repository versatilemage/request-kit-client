# 🤝 Contributing to Request Kit Client

Thank you for considering contributing to **Request Kit Client**! Your help is appreciated — whether it's fixing a bug, improving documentation, suggesting features, or adding tests.

---

## 📦 What is Request Kit Client?

Request Kit Client is a powerful, TypeScript-first API SDK for building modular, extendable, and type-safe HTTP service layers — built with Axios, tested with Vitest, and designed for modern frontend frameworks.

---

## 🚀 Getting Started

### 1. Fork the Repo

Click the **Fork** button on [GitHub](https://github.com/versatilemage/request-kit-client) and clone your fork:

```bash
git clone https://github.com/versatilemage/request-kit-client.git
cd request-kit-client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run in Dev Mode

```bash
npm run dev
```

### 4. Run Tests

```bash
npm run test       # Run all tests once
npm run test:watch # Watch mode
```

---

## 🧪 Project Structure

```bash
src/
├── http/         # Axios client & wrappers
├── services/     # Modular service layers (auth, user, etc.)
├── utils/        # Utility functions (e.g. cache, error handling)
├── routes/       # API route maps
├── types/        # Request/response and internal types
└── index.ts      # Entrypoint

tests/
├── http/         # Unit tests for http layer
├── service/      # Tests for auth/user/custom services
├── utils/        # Tests for helpers
└── mock/         # Mocks for wrappedHttp and responses
```

---

## 🛠️ Guidelines

### 🧼 Code Style

* Format with **Prettier**
* Use consistent naming (camelCase for vars, PascalCase for types/interfaces)
* Maintain clear file/module boundaries

### 🧠 Type Safety

* Keep everything typed with `T | null`, `NormalizedError`, etc.
* Do not skip types — that’s the core of this package!

### 🧪 Testing

* All services and utils should have matching unit tests
* Test files live in `tests/` — organized by category
* Use `createMockHttp()` to mock network calls in tests

---

## 🧩 Adding Features

When adding a feature:

1. **Open an issue first** if it's a major change.
2. Use a new branch:

   ```
   git checkout -b feat/custom-service
   ```
3. Follow this pattern for API changes:

   ```ts
   const customService = createCustomService(api.http, {
     getData: {
       method: "get",
       endpoint: "/data",
     }
   });
   ```

---

## 🔐 Unauthorized Logic

If you're working on auth logic, use the `onUnauthorized` hook instead of hardcoding 401 behavior:

```ts
onUnauthorized: (status) => {
  if (status === 401 || status === 403) {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  }
}
```

---

## ✅ Pull Request Checklist

Before submitting a PR:

* [ ] Code compiles and builds (`npm run build`)
* [ ] Tests pass (`npm run test`)
* [ ] Feature is documented in `README.md` (if applicable)
* [ ] No breaking changes without discussion
* [ ] Follow semantic PR title (e.g., `fix:`, `feat:`, `chore:`)

---

## 🗣 Feedback & Discussion

* Open an [issue](https://github.com/versatilemage/request-kit-client/issues)
* Use descriptive titles and include reproduction steps
* Feel free to tag issues with `enhancement`, `bug`, `discussion`, etc.

---

## 🙌 Thank You!

Contributing improves the package *and* helps other developers build faster, safer, and more scalable apps.
Your efforts are recognized — feel free to add yourself to the contributors list in the README once your PR is merged 💖
