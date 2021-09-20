import { expect } from 'chai';
import proxyquire from 'proxyquire';
// relative imports
import appRegistry from './fixtures/createReactPages.fixture';

const createReactPages = proxyquire.noCallThru()('../create-react-pages.js', {
  '../../../../applications/registry.json': appRegistry,
});

beforeEach(() => {});

describe('createReactPages', () => {
  it('should add <h2> ids to "On this Page" table of contents', done => {
    const files = {};
    const testDrupalData = {
      data: {
        alerts: [],
        banners: [],
        bannerAlerts: [],
      },
    };

    createReactPages(files, testDrupalData, () => {
      expect(files['covid19screen/index.html']).to.deep.include({
        title: 'COVID-19 screening tool',
        entryname: 'covid19screen',
        path: 'covid19screen',
        isDrupalPage: true,
        debug: null,
        layout: 'page-react.html',
        entityUrl: { path: '/covid19screen' },
        alertItems: { alert: [] },
        bannerAlert: [],
        banners: [],
      });

      done();
    });
  });
});
