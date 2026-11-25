/**
 * Shared JSDoc type definitions (plain JavaScript project — these give editor
 * autocomplete via `@type` / `@param` annotations without a TypeScript build step).
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} current_page
 * @property {number} per_page
 * @property {number} total
 * @property {number} [last_page]
 */

/**
 * @template T
 * @typedef {Object} Paginated
 * @property {T[]} data
 * @property {PaginationMeta} meta
 */

/**
 * Query params understood by every index endpoint.
 * @typedef {Object} ListParams
 * @property {number} [page]
 * @property {number} [per_page]
 * @property {string} [search]
 * @property {string} [sort]                  e.g. "name" or "-created_at"
 * @property {Record<string, any>} [filter]   e.g. { status: 'active' }
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {'admin'|'user'} role
 * @property {boolean} is_active
 * @property {number} [orders_count]
 * @property {string} created_at
 */

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} name
 * @property {string} sku
 * @property {string|null} description
 * @property {string|null} category
 * @property {number} price
 * @property {number} stock
 * @property {'active'|'inactive'} status
 * @property {string} created_at
 */

/**
 * @typedef {Object} Order
 * @property {number} id
 * @property {string} order_number
 * @property {number} user_id
 * @property {number} product_id
 * @property {number} quantity
 * @property {number} unit_price
 * @property {number} total
 * @property {'pending'|'processing'|'completed'|'cancelled'} status
 * @property {string|null} notes
 * @property {{id:number,name:string,email:string}} [user]
 * @property {{id:number,name:string,sku:string}} [product]
 * @property {string} created_at
 */

/**
 * Field definition consumed by <FormModal />.
 * @typedef {Object} FieldConfig
 * @property {string} name
 * @property {string} label
 * @property {'text'|'email'|'password'|'number'|'money'|'textarea'|'select'|'switch'|'date'} [type]
 * @property {Array<{label:string,value:any}>} [options]   for type "select"
 * @property {import('antd').FormRule[]} [rules]
 * @property {string} [placeholder]
 * @property {string} [help]
 * @property {boolean|((mode:'create'|'edit') => boolean)} [hidden]
 * @property {boolean|((mode:'create'|'edit') => boolean)} [required]
 * @property {number} [span]                              grid column span (1-24), default 24
 * @property {Object} [props]                             extra props passed to the input
 */

/**
 * Field definition consumed by <FilterDrawer /> / DataTable filterFields.
 * @typedef {Object} FilterFieldConfig
 * @property {string} name
 * @property {string} label
 * @property {'text'|'select'|'number'|'date'|'dateRange'} [type]
 * @property {Array<{label:string,value:any}>} [options]   for type "select"
 * @property {'multiple'} [mode]                           for type "select"
 * @property {[string, string]} [keys]                     for type "dateRange", default ['from','to']
 * @property {string} [placeholder]
 * @property {Object} [props]                              extra props passed to the input
 */

export {};
