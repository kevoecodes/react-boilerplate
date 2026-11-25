# react-boilerplate

An admin-panel starter built with **React 18 + Vite** in plain **JavaScript (JSX)**, **Ant Design 5** and
**Tailwind CSS**, with React Router, TanStack Query and axios. It talks to the
[laravel-boilerplate](https://github.com/kevoecodes/laravel-boilerplate) API.

> **New machine?** Follow [SETUP.md](SETUP.md): copy-paste PowerShell steps for a fresh Windows 10/11 PC.
> **The backend must be running first.**

## Features

- **Ant Design 5 + Tailwind CSS** side by side. Tailwind's preflight is disabled so it doesn't fight AntD's base
  styles, and both read the same theme tokens (`src/utils/theme.js`).
- **Layout:** collapsible AntD `Sider` with icons and nested menus, a header with breadcrumbs and a user dropdown,
  and a content area
- **Auth:** login page, token kept in `localStorage`, protected routes, automatic logout on any `401`
- **Data:** axios client with a token interceptor, TanStack Query for caching, loading states and invalidation
- **Reusable components**
  - `DataTable`: AntD Table with server-side pagination and sorting, a debounced search bar, a filter slot and row actions
  - `FormModal`: generic create/edit modal driven by a field config. It shows 422 errors under the right fields.
  - `ConfirmModal`, `DetailDrawer`
  - `PageHeader`: title, breadcrumbs and action buttons
- **Sample pages:** Dashboard (stat cards, orders by status, recent orders), plus Users, Products and Orders with
  full CRUD
- **ESLint + Prettier**

## Quick start

```bash
git clone https://github.com/kevoecodes/react-boilerplate.git
cd react-boilerplate
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:8000/api/v1
npm run dev               # http://localhost:5173
```

Sign in with `admin@example.com` / `password` (seeded by laravel-boilerplate).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on <http://localhost:5173> |
| `npm run build` | Production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` / `lint:fix` | ESLint (Prettier runs as an ESLint rule) |
| `npm run format` / `format:check` | Prettier |

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:8000/api/v1` | Base URL of the Laravel API (no trailing slash) |
| `VITE_APP_NAME` | `React Boilerplate` | Name in the sidebar and on the login page |

`VITE_*` values are baked in when Vite starts. Restart `npm run dev` after changing `.env`.

## Project structure

```
src/
  api/          client.js (axios + interceptors), auth.js, resource.js (generic REST client per resource)
  components/   DataTable, FormModal, ConfirmModal, DetailDrawer, PageHeader, StatusTag, AuthProvider, ...
  hooks/        useAuth, useTableParams, useResource (TanStack Query hooks), useCrud, useDebounce
  layouts/      AppLayout (Sider + Header + breadcrumbs + Content)
  pages/        LoginPage, DashboardPage, NotFoundPage, users/, products/, orders/
  routes/       router (index.jsx), ProtectedRoute / GuestRoute, menu.jsx (sidebar + breadcrumb config)
  types/        JSDoc typedefs (User, Product, Order, FieldConfig, ...) for editor autocomplete
  utils/        theme.js (shared tokens), format.js, errors.js, storage.js
```

`@/` is an alias for `src/` (configured in `vite.config.js` and `jsconfig.json`).

## How the pieces fit

A typical CRUD page:

```jsx
const { params, setParams, setFilter } = useTableParams({ sort: '-created_at' });
const list = productsResource.useList(params);          // GET /products?page=&per_page=&search=&sort=&filter[..]=
const create = productsResource.useCreate();            // POST, then invalidates the list + dashboard

<DataTable
  columns={[{ title: 'Name', dataIndex: 'name', sorter: true }]}
  data={list.data?.data}
  meta={list.data?.meta}                                 // { current_page, per_page, total }
  loading={list.isFetching}
  params={params}
  onParamsChange={setParams}
  filters={<Select onChange={(v) => setFilter('status', v)} ... />}
  rowActions={[{ key: 'edit', label: 'Edit', icon: <EditOutlined />, onClick: openEdit }]}
/>

<FormModal
  open={open}
  mode="create"
  entity="product"
  fields={[
    { name: 'name', label: 'Name', required: true },
    { name: 'price', label: 'Price', type: 'money', required: true, span: 12 },
    { name: 'status', label: 'Status', type: 'select', options, required: true, span: 12 },
  ]}
  onSubmit={(values) => create.mutateAsync(values)}     // 422 errors are mapped onto the fields
  onClose={close}
/>
```

Field types: `text`, `email`, `password`, `number`, `money`, `textarea`, `select`, `switch`, `date`. `required` and
`hidden` can be functions of the mode (`'create' | 'edit'`), e.g. the password field is required only when creating.

### Adding a page

1. `src/api/resource.js`: `export const thingsApi = createResourceApi('things');`
2. `src/hooks/useResource.js`: `export const thingsResource = createResourceHooks('things', thingsApi);`
3. Copy `src/pages/products/ProductsPage.jsx` and adjust the columns, fields and filters
4. Add the route in `src/routes/index.jsx` and the menu entry in `src/routes/menu.jsx`

### Theme

Change colors, radius or font in `src/utils/theme.js`. AntD gets them through `ConfigProvider` and Tailwind through
`tailwind.config.js`, so `bg-primary` / `text-danger` always match AntD's `colorPrimary` / `colorError`.

## License

MIT
