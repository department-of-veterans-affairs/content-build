# React Skeleton + Hydration Implementation Plan
## Prototype: mhv-medications-refills App

## Overview
Create a new `mhv-medications-refills` app that demonstrates skeleton screen generation and React hydration, following the architecture patterns of the existing `mhv-medications` app with RTK Query and React Router data loaders.

**Key Requirements:**
- Use RTK Query for API data fetching
- Use React Router v6 data loaders for route-level data prefetching
- Generate skeleton HTML from React component at build time
- Enable React hydration instead of client-side rendering
- Maintain existing mhv-medications patterns

---

## Architecture Pattern

### Current mhv-medications Architecture
```
app-entry.jsx
  └─ Provider (Redux store)
      └─ RouterProvider (React Router v6)
          └─ routes.jsx
              ├─ loader: prescriptionsLoader() [defers data fetch]
              └─ RouteWrapper
                  └─ AppProviders (user context)
                      └─ App (layout container)
                          └─ RxBreadcrumbs
                          └─ Suspense + lazy-loaded Component

store.js
  └─ Redux store with:
      ├─ prescriptionsApi.middleware (RTK Query)
      ├─ allergiesApi.middleware (RTK Query)
      └─ Combined reducers:
          ├─ rx.preferences (regular slice)
          ├─ prescriptionsApi.reducerPath
          └─ allergiesApi.reducerPath

Loaders Pattern:
  prescriptionsLoader({ params })
    └─ store.dispatch(getPrescriptionsList.initiate(queryParams))
    └─ defer(Promise.all(fetchPromises))
```

### New Pattern for Skeleton + Hydration
```
Build Time:
  SkeletonManifestPlugin
    └─ Renders <MedicationsRefillPage.Skeleton />
    └─ Outputs skeleton-manifest.json

Content-Build:
  create-react-pages.js
    └─ Reads skeleton-manifest.json
    └─ Injects skeletonHTML into page data

Browser (Initial Load):
  HTML with skeleton → instant visual feedback
  JS loads → hydrateRoot() → React takes over
  Route loaders fetch data → UI updates

Runtime Flow:
  1. User sees skeleton immediately
  2. React hydrates existing DOM
  3. Data loaders dispatch RTK Query
  4. Cache hits or API fetches
  5. Component re-renders with data
```

---

## Phase 1: Create New App Structure (vets-website)

### Directory Structure
```
src/applications/mhv-medications-refills/
├── manifest.json                    [NEW - app metadata + skeleton config]
├── app-entry.jsx                    [NEW - entry point with RouterProvider]
├── routes.jsx                       [NEW - route definitions with loaders]
├── store.js                         [NEW - Redux store with RTK Query middleware]
├── reducers/
│   └── index.js                     [NEW - combine reducers]
├── redux/
│   └── preferencesSlice.js          [NEW - UI preferences slice]
├── api/
│   └── refillsApi.js                [NEW - RTK Query API definition]
├── loaders/
│   └── refillsLoader.js             [NEW - route loader function]
├── containers/
│   ├── App.jsx                      [NEW - layout container]
│   ├── AppProviders.jsx             [NEW - context providers]
│   └── MedicationsRefillPage.jsx    [NEW - main page component]
├── components/
│   └── MedicationsRefillPage.Skeleton.jsx  [NEW - skeleton component]
└── sass/
    └── medications-refills.scss     [NEW - styles]
```

### File: `manifest.json`
```json
{
  "appName": "MHV Medications Refills",
  "entryFile": "./app-entry.jsx",
  "entryName": "medications-refills",
  "rootUrl": "/my-health/medications-refills",
  "productId": "NEW-UUID-HERE",
  "skeletonComponent": "./components/MedicationsRefillPage.Skeleton.jsx"
}
```

### File: `store.js`
```javascript
import setUpCommonFunctionality from 'platform/startup/setup';
import { refillsApi } from './api/refillsApi';
import manifest from './manifest.json';
import reducer from './reducers';

export default function createStore(
  additionalMiddlewares = [refillsApi.middleware],
) {
  return setUpCommonFunctionality({
    entryName: manifest.entryName,
    url: manifest.rootUrl,
    reducer,
    preloadScheduledDowntimes: true,
    additionalMiddlewares,
  });
}

export const store = createStore();
```

### File: `reducers/index.js`
```javascript
import { combineReducers } from 'redux';
import { refillsApi } from '../api/refillsApi';
import preferencesReducer from '../redux/preferencesSlice';

const rootReducer = {
  rx: combineReducers({
    preferences: preferencesReducer,
  }),
  [refillsApi.reducerPath]: refillsApi.reducer,
};

export default rootReducer;
```

### File: `api/refillsApi.js`
```javascript
import { createApi } from '@reduxjs/toolkit/query/react';
import {
  apiRequest,
  environment,
} from '@department-of-veterans-affairs/platform-utilities/exports';

const apiBasePath = `${environment.API_URL}/my_health/v1`;

export const refillsApi = createApi({
  reducerPath: 'refillsApi',
  baseQuery: async ({ path, options = {} }) => {
    const defaultOptions = {
      headers: { 'Content-Type': 'application/json' },
    };
    try {
      const result = await apiRequest(path, { ...defaultOptions, ...options });
      return { data: result };
    } catch ({ errors }) {
      return {
        error: {
          status: errors?.[0]?.status || 500,
          message: errors?.[0]?.title || 'Failed to fetch data',
        },
      };
    }
  },
  keepUnusedDataFor: 60 * 60, // 1 hour cache
  tagTypes: ['Refill'],
  endpoints: builder => ({
    getRefillablePrescriptions: builder.query({
      query: () => ({
        path: `${apiBasePath}/prescriptions/refillable`,
      }),
      providesTags: ['Refill'],
      transformResponse: response => {
        if (response?.data && Array.isArray(response.data)) {
          return {
            prescriptions: response.data,
            meta: response.meta || {},
          };
        }
        return { prescriptions: [], meta: {} };
      },
    }),
  }),
});

export const { useGetRefillablePrescriptionsQuery } = refillsApi;
export const { getRefillablePrescriptions } = refillsApi.endpoints;
```

### File: `loaders/refillsLoader.js`
```javascript
import { defer } from 'react-router-dom-v5-compat';
import { store } from '../store';
import { getRefillablePrescriptions } from '../api/refillsApi';

/**
 * Route loader for refills page
 * Initiates data fetch using RTK Query when route is accessed
 * Returns deferred promise for React Router to handle
 */
export const refillsLoader = () => {
  const fetchPromise = store.dispatch(
    getRefillablePrescriptions.initiate(undefined),
  );
  return defer(fetchPromise);
};
```

### File: `routes.jsx`
```jsx
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom-v5-compat';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { selectUser } from '@department-of-veterans-affairs/platform-user/selectors';
import manifest from './manifest.json';
import AppProviders from './containers/AppProviders';
import App from './containers/App';
import { refillsLoader } from './loaders/refillsLoader';

const MedicationsRefillPage = lazy(() =>
  import('./containers/MedicationsRefillPage'),
);

const Loading = () => (
  <va-loading-indicator
    message="Loading..."
    set-focus
    data-testid="loading-indicator"
  />
);

const RouteWrapper = props => {
  const user = useSelector(selectUser);
  
  return (
    <AppProviders user={user}>
      <App>
        <Suspense fallback={<Loading />}>
          {props.children || <props.Component {...props} />}
        </Suspense>
      </App>
    </AppProviders>
  );
};

RouteWrapper.propTypes = {
  Component: PropTypes.elementType,
  children: PropTypes.node,
};

const routes = [
  {
    path: '/',
    element: <RouteWrapper Component={MedicationsRefillPage} />,
    loader: refillsLoader, // Pre-fetch data using RTK Query
  },
];

const router = createBrowserRouter(routes, {
  basename: manifest.rootUrl,
});

export { routes, router as default };
```

### File: `app-entry.jsx`
```jsx
import 'platform/polyfills';
import './sass/medications-refills.scss';

import React from 'react';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom-v5-compat';

import startReactApp from 'platform/startup/react';

import router from './routes';
import { store } from './store';

const App = () => (
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);

// Pass hydration flag - will be handled by updated startReactApp
startReactApp(<App />, { hydrate: true });

export { store };
```

### File: `components/MedicationsRefillPage.Skeleton.jsx`
```jsx
import React from 'react';

/**
 * Skeleton screen for medications refill page
 * This will be rendered to static HTML at build time
 * and injected into the initial page load for instant visual feedback
 */
const MedicationsRefillPageSkeleton = () => (
  <div className="medications-refills-skeleton" data-skeleton="true">
    <h1 className="skeleton-shimmer" style={{ width: '300px', height: '36px' }}>
      {/* Refill prescriptions */}
    </h1>
    
    <div className="skeleton-card" style={{ marginTop: '2rem' }}>
      <div className="skeleton-shimmer" style={{ width: '200px', height: '24px', marginBottom: '1rem' }} />
      <div className="skeleton-shimmer" style={{ width: '100%', height: '60px', marginBottom: '0.5rem' }} />
      <div className="skeleton-shimmer" style={{ width: '100%', height: '60px', marginBottom: '0.5rem' }} />
      <div className="skeleton-shimmer" style={{ width: '100%', height: '60px' }} />
    </div>
    
    <div className="skeleton-card" style={{ marginTop: '1rem' }}>
      <div className="skeleton-shimmer" style={{ width: '200px', height: '24px', marginBottom: '1rem' }} />
      <div className="skeleton-shimmer" style={{ width: '100%', height: '60px', marginBottom: '0.5rem' }} />
      <div className="skeleton-shimmer" style={{ width: '100%', height: '60px' }} />
    </div>
  </div>
);

export default MedicationsRefillPageSkeleton;
```

### File: `sass/medications-refills.scss`
```scss
.medications-refills-skeleton {
  padding: 2rem 0;
  
  .skeleton-card {
    background: white;
    border: 1px solid #dfe1e2;
    border-radius: 4px;
    padding: 1.5rem;
  }
  
  .skeleton-shimmer {
    background: linear-gradient(
      90deg,
      #f0f0f0 0%,
      #e0e0e0 50%,
      #f0f0f0 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 4px;
  }
  
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
}
```

---

## Phase 2: Webpack Plugin for Skeleton Generation (vets-website)

### File: `config/webpack-plugins/SkeletonManifestPlugin.js`
```javascript
import fs from 'fs';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

/**
 * Webpack plugin to generate skeleton HTML from React components
 * Scans all app manifest.json files for skeletonComponent
 * Renders them to static HTML and creates skeleton-manifest.json
 */
class SkeletonManifestPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('SkeletonManifestPlugin', (compilation, callback) => {
      try {
        const skeletons = {};
        const srcPath = path.resolve(__dirname, '../../src/applications');
        
        // Find all manifest.json files
        const findManifests = (dir) => {
          const manifests = [];
          const items = fs.readdirSync(dir, { withFileTypes: true });
          
          for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
              manifests.push(...findManifests(fullPath));
            } else if (item.name === 'manifest.json') {
              manifests.push(fullPath);
            }
          }
          return manifests;
        };
        
        const manifestPaths = findManifests(srcPath);
        
        // Process each manifest
        for (const manifestPath of manifestPaths) {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
          
          if (manifest.skeletonComponent) {
            const appDir = path.dirname(manifestPath);
            const skeletonPath = path.resolve(appDir, manifest.skeletonComponent);
            
            // Import and render the skeleton component
            // Note: In production, would use require() with babel-register
            // For now, using dynamic import
            delete require.cache[skeletonPath]; // Clear cache
            const SkeletonComponent = require(skeletonPath).default;
            
            if (SkeletonComponent) {
              const html = ReactDOMServer.renderToStaticMarkup(
                React.createElement(SkeletonComponent)
              );
              
              skeletons[manifest.entryName] = {
                html,
                rootUrl: manifest.rootUrl,
              };
              
              console.log(`✓ Generated skeleton for ${manifest.entryName}`);
            }
          }
        }
        
        // Write skeleton-manifest.json
        const outputPath = path.resolve(
          compiler.options.output.path,
          '../generated/skeleton-manifest.json'
        );
        
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(
          outputPath,
          JSON.stringify(skeletons, null, 2),
          'utf8'
        );
        
        console.log(`\n✓ Skeleton manifest generated: ${outputPath}`);
        console.log(`  Entries: ${Object.keys(skeletons).length}\n`);
        
        callback();
      } catch (error) {
        console.error('SkeletonManifestPlugin error:', error);
        callback(error);
      }
    });
  }
}

export default SkeletonManifestPlugin;
```

### File: `config/webpack.config.js` (modification)
```javascript
// Add to imports
import SkeletonManifestPlugin from './webpack-plugins/SkeletonManifestPlugin';

// Add to plugins array in baseConfig
baseConfig.plugins.push(new SkeletonManifestPlugin());
```

---

## Phase 3: Content-Build Integration

### File: `src/site/stages/build/plugins/create-react-pages.js` (modification)
```javascript
// Add function to load skeleton manifest
function loadSkeletonManifest() {
  const skeletonPath = path.join(
    ENVIRONMENTS[buildtype].buildFolder,
    '../vets-website/build/localhost/generated/skeleton-manifest.json'
  );
  
  try {
    if (fs.existsSync(skeletonPath)) {
      const content = fs.readFileSync(skeletonPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn('Could not load skeleton manifest:', error.message);
  }
  return {};
}

// In createReactPages function, before appRegistry.forEach:
const skeletonManifest = loadSkeletonManifest();

// Inside appRegistry.forEach loop, add skeleton HTML:
const filePath = getAppFilePath(app, buildtype);
files[filePath] = {
  title: app.appName,
  entryname: app.entryName,
  layout: 'page-react',
  vagovprod: true,
  includeBreadcrumbs: app.includeBreadcrumbs,
  skeletonHTML: skeletonManifest[app.entryName]?.html || '', // ADD THIS
};
```

### File: `src/site/components/react-loader.html` (modification)
```liquid
<div id="react-root">
  {% if skeletonHTML %}
    {{ skeletonHTML }}
  {% else %}
    <div class="loading-indicator-container">
      <div class="loading-indicator">
        <div class="loading-indicator__spinner"></div>
        <span class="loading-indicator__message">Loading application...</span>
      </div>
    </div>
  {% endif %}
</div>
```

---

## Phase 4: Add Hydration Support to Platform (vets-website)

### File: `src/platform/startup/react.js` (modification)
```javascript
import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Starts a React application by rendering it into the DOM
 * @param {React.Element} component - The root React component to render
 * @param {Object} options - Configuration options
 * @param {boolean} options.hydrate - Whether to hydrate existing HTML (default: false)
 */
export default function startReactApp(component, options = {}) {
  const { hydrate = false } = options;
  const root = document.getElementById('react-root');
  
  if (!root) {
    console.error('Cannot find #react-root element');
    return;
  }
  
  if (hydrate && root.hasChildNodes()) {
    // Use hydration if skeleton HTML exists
    const { hydrateRoot } = require('react-dom/client');
    hydrateRoot(root, component);
  } else {
    // Fall back to client-side render
    ReactDOM.render(component, root);
  }
}
```

---

## Phase 5: Testing Strategy

### Build-Time Tests
```javascript
// config/webpack-plugins/SkeletonManifestPlugin.unit.spec.js
describe('SkeletonManifestPlugin', () => {
  it('should find all manifest.json files with skeletonComponent', () => {});
  it('should render skeleton components to static HTML', () => {});
  it('should generate skeleton-manifest.json', () => {});
  it('should handle missing skeleton components gracefully', () => {});
});
```

### Integration Tests
```javascript
// src/applications/mhv-medications-refills/tests/app.unit.spec.js
describe('Medications Refills App', () => {
  it('should render skeleton component to static HTML', () => {});
  it('should hydrate without errors when skeleton present', () => {});
  it('should fall back to render when no skeleton', () => {});
});
```

### E2E Tests (Cypress)
```javascript
// src/applications/mhv-medications-refills/tests/refills.cypress.spec.js
describe('Medications Refills E2E', () => {
  it('should show skeleton immediately on page load', () => {
    cy.visit('/my-health/medications-refills');
    cy.get('[data-skeleton="true"]').should('be.visible');
  });
  
  it('should hydrate and load data via RTK Query', () => {
    cy.intercept('GET', '**/prescriptions/refillable', {
      fixture: 'refillable-prescriptions.json'
    }).as('getRefills');
    
    cy.visit('/my-health/medications-refills');
    cy.wait('@getRefills');
    cy.get('[data-skeleton="true"]').should('not.exist');
    cy.get('[data-testid="prescription-list"]').should('be.visible');
  });
  
  it('should preserve skeleton during hydration (no flicker)', () => {
    // Use performance API or visual regression testing
  });
});
```

### Loader Tests
```javascript
// src/applications/mhv-medications-refills/tests/loaders/refillsLoader.unit.spec.js
describe('refillsLoader', () => {
  it('should dispatch getRefillablePrescriptions RTK Query', () => {});
  it('should return deferred promise', () => {});
  it('should handle API errors gracefully', () => {});
});
```

---

## Phase 6: Success Criteria

### Build Process
- ✅ Webpack builds without errors
- ✅ `skeleton-manifest.json` generated in `build/localhost/generated/`
- ✅ File contains entry for `medications-refills` with HTML
- ✅ HTML validates (no React-specific attributes, pure HTML)

### Content-Build
- ✅ `create-react-pages.js` loads skeleton manifest successfully
- ✅ Generated HTML includes skeleton HTML in `#react-root`
- ✅ Falls back to loading spinner if manifest unavailable

### Runtime Behavior
- ✅ Skeleton appears **immediately** (before JS loads)
- ✅ React hydrates without warnings or errors
- ✅ RTK Query loader fetches data on route entry
- ✅ UI updates with data from cache or API
- ✅ No content flicker during hydration
- ✅ Lighthouse performance score improves (FCP, LCP metrics)

### Developer Experience
- ✅ Single source of truth (skeleton is React component)
- ✅ Skeleton stays in sync with real UI automatically
- ✅ Build fails with clear error if skeleton render fails
- ✅ Documentation updated with patterns

---

## Implementation Order

1. **Create App Structure** (vets-website)
   - New directory with all files
   - RTK Query API definition
   - Route loaders with defer
   - Skeleton component

2. **Add Skeleton Plugin** (vets-website)
   - `SkeletonManifestPlugin.js`
   - Integrate into webpack config
   - Test skeleton-manifest.json generation

3. **Update Platform Hydration** (vets-website)
   - Modify `src/platform/startup/react.js`
   - Add hydrate option support
   - Test with/without skeleton HTML

4. **Content-Build Integration**
   - Update `create-react-pages.js`
   - Modify `react-loader.html`
   - Test HTML generation

5. **Test & Validate**
   - Unit tests for all new code
   - E2E tests for user flow
   - Performance measurement
   - Visual regression tests

6. **Documentation**
   - Update developer docs
   - Add code comments
   - Create migration guide

---

## Key Patterns from mhv-medications

### RTK Query Pattern
```javascript
// Define API with createApi
export const refillsApi = createApi({
  reducerPath: 'refillsApi',
  baseQuery: apiRequest wrapper,
  endpoints: builder => ({
    getRefillablePrescriptions: builder.query({...})
  })
});

// Add middleware to store
const store = createStore([refillsApi.middleware]);

// Add reducer to rootReducer
[refillsApi.reducerPath]: refillsApi.reducer
```

### Data Loader Pattern
```javascript
// Loader dispatches RTK Query endpoint
export const refillsLoader = () => {
  const promise = store.dispatch(
    getRefillablePrescriptions.initiate()
  );
  return defer(promise); // React Router handles the promise
};

// Route definition
{
  path: '/',
  element: <Component />,
  loader: refillsLoader, // Called before route renders
}
```

### Component Pattern
```javascript
// Component uses RTK Query hook
function MedicationsRefillPage() {
  const { data, isLoading, error } = useGetRefillablePrescriptionsQuery();
  
  // Data is already in cache from loader
  // isLoading will be false on initial render
}
```

---

## Benefits of This Approach

1. **Performance**: Skeleton appears in ~50ms (HTML parse), not 3-5s (JS load)
2. **DX**: Single source of truth - skeleton is React component
3. **Maintainability**: Skeleton updates automatically with component changes
4. **Patterns**: Follows existing mhv-medications architecture
5. **Progressive**: Gracefully degrades if skeleton unavailable
6. **Standards**: Uses React 18 hydration API correctly
7. **Caching**: RTK Query handles data caching automatically
8. **Loading**: Data loaders prefetch before route renders

---

## Implementation Checklist

### Pre-Implementation
- [ ] Review and approve this plan
- [ ] Create feature branches:
  - [ ] `vets-website`: `feature/skeleton-hydration-prototype`
  - [ ] `content-build`: `feature/skeleton-hydration-support`
- [ ] Ensure both repos are on latest main branch
- [ ] Verify dev environment is running (`yarn install` in both repos)

### Phase 1: Create App Structure (vets-website)
- [ ] Create base directory: `src/applications/mhv-medications-refills/`
- [ ] Create `manifest.json` with skeleton component reference
- [ ] Create `package.json` if needed (or verify monorepo handles it)
- [ ] Create Redux store setup:
  - [ ] `store.js` with RTK Query middleware
  - [ ] `reducers/index.js` with combined reducers
  - [ ] `redux/preferencesSlice.js` for UI state
- [ ] Create RTK Query API:
  - [ ] `api/refillsApi.js` with `createApi`
  - [ ] Define `getRefillablePrescriptions` endpoint
  - [ ] Add transformResponse logic
  - [ ] Export auto-generated hooks
- [ ] Create data loader:
  - [ ] `loaders/refillsLoader.js`
  - [ ] Implement `defer()` pattern
  - [ ] Dispatch RTK Query endpoint
- [ ] Create routing:
  - [ ] `routes.jsx` with route definitions
  - [ ] Attach loader to route
  - [ ] Setup RouteWrapper pattern
  - [ ] Configure lazy loading with Suspense
- [ ] Create containers:
  - [ ] `containers/App.jsx` (layout wrapper)
  - [ ] `containers/AppProviders.jsx` (context providers)
  - [ ] `containers/MedicationsRefillPage.jsx` (main page)
- [ ] Create skeleton component:
  - [ ] `components/MedicationsRefillPage.Skeleton.jsx`
  - [ ] Design skeleton UI matching target layout
  - [ ] Ensure component is server-renderable (no DOM APIs)
- [ ] Create styles:
  - [ ] `sass/medications-refills.scss`
  - [ ] Add skeleton shimmer animations
  - [ ] Style skeleton cards and placeholders
- [ ] Create app entry point:
  - [ ] `app-entry.jsx` with Provider + RouterProvider
  - [ ] Pass `{ hydrate: true }` to startReactApp
- [ ] Test app loads in dev mode:
  - [ ] `yarn watch --env entry=medications-refills`
  - [ ] Verify app renders (without skeleton for now)
  - [ ] Check Redux DevTools shows RTK Query slices

### Phase 2: Webpack Skeleton Plugin (vets-website)
- [ ] Create plugin file: `config/webpack-plugins/SkeletonManifestPlugin.js`
- [ ] Implement manifest discovery:
  - [ ] Recursively find all `manifest.json` files
  - [ ] Filter for those with `skeletonComponent` property
- [ ] Implement skeleton rendering:
  - [ ] Dynamically require skeleton components
  - [ ] Use `ReactDOMServer.renderToStaticMarkup()`
  - [ ] Handle render errors gracefully
- [ ] Implement manifest generation:
  - [ ] Create output directory: `build/localhost/generated/`
  - [ ] Write `skeleton-manifest.json`
  - [ ] Include entryName, rootUrl, and HTML
- [ ] Add plugin to webpack config:
  - [ ] Import plugin in `config/webpack.config.js`
  - [ ] Add to plugins array in baseConfig
  - [ ] Verify plugin runs during build
- [ ] Test skeleton generation:
  - [ ] Run `yarn build --entry=medications-refills`
  - [ ] Verify `build/localhost/generated/skeleton-manifest.json` exists
  - [ ] Verify HTML is valid (no React attributes)
  - [ ] Check console output for success messages
- [ ] Write unit tests:
  - [ ] `config/webpack-plugins/SkeletonManifestPlugin.unit.spec.js`
  - [ ] Test manifest discovery
  - [ ] Test HTML rendering
  - [ ] Test error handling

### Phase 3: Platform Hydration Support (vets-website)
- [ ] Modify `src/platform/startup/react.js`:
  - [ ] Add `options` parameter with `hydrate` flag
  - [ ] Check if `#react-root` has child nodes
  - [ ] Import `hydrateRoot` from `react-dom/client`
  - [ ] Use `hydrateRoot()` when hydrate=true and HTML exists
  - [ ] Fall back to `ReactDOM.render()` otherwise
  - [ ] Add console logging for debugging
- [ ] Test hydration in dev mode:
  - [ ] Manually inject skeleton HTML into #react-root
  - [ ] Verify hydrateRoot is called (check console)
  - [ ] Verify no hydration mismatch warnings
- [ ] Write unit tests:
  - [ ] `src/platform/startup/react.unit.spec.js`
  - [ ] Test render path (no skeleton)
  - [ ] Test hydrate path (with skeleton)
  - [ ] Test error handling

### Phase 4: Content-Build Integration (content-build repo)
- [ ] Modify `src/site/stages/build/plugins/create-react-pages.js`:
  - [ ] Add `loadSkeletonManifest()` function
  - [ ] Determine correct path to skeleton-manifest.json
  - [ ] Handle file not found gracefully
  - [ ] Parse JSON safely
  - [ ] Add `skeletonHTML` property to file objects
  - [ ] Log skeleton loading status
- [ ] Modify `src/site/components/react-loader.html`:
  - [ ] Add Liquid conditional: `{% if skeletonHTML %}`
  - [ ] Render skeletonHTML when available
  - [ ] Keep loading spinner as fallback
  - [ ] Test with sample HTML
- [ ] Test content-build process:
  - [ ] Run `yarn install-repos` to get latest vets-website
  - [ ] Run `yarn build` or relevant build command
  - [ ] Check generated HTML for skeleton content
  - [ ] Verify fallback works when manifest missing
- [ ] Write unit tests (if applicable):
  - [ ] Test loadSkeletonManifest function
  - [ ] Test file object creation with skeleton

### Phase 5: Integration Testing
- [ ] Build both repos:
  - [ ] `vets-website`: `yarn build --entry=medications-refills`
  - [ ] `content-build`: Ensure it picks up vets-website build
- [ ] Test full workflow:
  - [ ] Start dev server: `yarn watch --env entry=medications-refills`
  - [ ] Visit `/my-health/medications-refills`
  - [ ] Verify skeleton appears immediately in Network throttling
  - [ ] Verify React hydrates (check React DevTools)
  - [ ] Verify RTK Query loader fetches data
  - [ ] Verify no hydration warnings in console
  - [ ] Verify no content flicker
- [ ] Write E2E tests:
  - [ ] Create `src/applications/mhv-medications-refills/tests/refills.cypress.spec.js`
  - [ ] Test skeleton visibility on load
  - [ ] Test hydration and data loading
  - [ ] Test no flicker during hydration
  - [ ] Mock API responses
- [ ] Write unit tests:
  - [ ] Test loaders: `loaders/refillsLoader.unit.spec.js`
  - [ ] Test RTK Query: `api/refillsApi.unit.spec.js`
  - [ ] Test skeleton component renders
  - [ ] Test main page component
  - [ ] Test Redux slices

### Phase 6: Performance & Validation
- [ ] Measure performance:
  - [ ] Run Lighthouse audit (before/after)
  - [ ] Record First Contentful Paint (FCP)
  - [ ] Record Largest Contentful Paint (LCP)
  - [ ] Record Time to Interactive (TTI)
  - [ ] Document improvements
- [ ] Visual testing:
  - [ ] Compare skeleton to final UI
  - [ ] Verify no layout shift during hydration
  - [ ] Test on different screen sizes
  - [ ] Test with slow network (throttling)
- [ ] Accessibility testing:
  - [ ] Run axe DevTools
  - [ ] Test keyboard navigation
  - [ ] Test screen reader announcements
  - [ ] Verify loading states are announced
- [ ] Cross-browser testing:
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Edge (latest)
- [ ] Validate build artifacts:
  - [ ] Check skeleton-manifest.json format
  - [ ] Verify HTML is valid (W3C validator)
  - [ ] Check file sizes (HTML should be small)

### Phase 7: Documentation & Cleanup
- [ ] Update developer documentation:
  - [ ] Add skeleton pattern to VA.gov frontend docs
  - [ ] Document skeletonComponent in manifest.json
  - [ ] Add examples and best practices
  - [ ] Document hydration flag in startReactApp
- [ ] Code documentation:
  - [ ] Add JSDoc comments to all new functions
  - [ ] Add inline comments for complex logic
  - [ ] Update README files
- [ ] Create migration guide:
  - [ ] How to add skeleton to existing app
  - [ ] When to use skeleton vs loading spinner
  - [ ] Common pitfalls and solutions
- [ ] Clean up:
  - [ ] Remove debug console.logs
  - [ ] Remove commented-out code
  - [ ] Run linters: `yarn lint:js:fix`
  - [ ] Fix any warnings
- [ ] Verify all tests pass:
  - [ ] `yarn test:unit`
  - [ ] `yarn cy:run`
  - [ ] Fix any failures

### Phase 8: Code Review & Deployment
- [ ] Create pull requests:
  - [ ] vets-website PR with detailed description
  - [ ] content-build PR with detailed description
  - [ ] Link PRs to each other
  - [ ] Add before/after screenshots
  - [ ] Add performance metrics
- [ ] Address review feedback:
  - [ ] Make requested changes
  - [ ] Re-run tests
  - [ ] Update documentation
- [ ] Merge PRs:
  - [ ] Merge vets-website first
  - [ ] Merge content-build second
  - [ ] Monitor CI/CD pipelines
- [ ] Post-deployment validation:
  - [ ] Verify staging environment works
  - [ ] Check production build
  - [ ] Monitor error logs
  - [ ] Gather user feedback

### Rollback Plan
- [ ] Document rollback procedure:
  - [ ] Revert content-build changes (removes skeleton injection)
  - [ ] App continues to work with loading spinner
  - [ ] No data loss or broken functionality
- [ ] Test rollback in staging

---

## Progress Tracking

**Status Key:** ❌ Not Started | 🔄 In Progress | ✅ Complete | ⚠️ Blocked

### Current Status: ❌ Not Started

**Last Updated:** November 4, 2025

**Notes:**
- Plan approved and ready for implementation
- Waiting for branch creation

**Blockers:**
- None

---

Ready to proceed?
