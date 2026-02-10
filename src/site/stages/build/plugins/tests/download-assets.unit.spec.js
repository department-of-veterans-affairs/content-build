/* eslint-disable @department-of-veterans-affairs/axe-check-required */
import { expect } from 'chai';
import sinon from 'sinon';
import { fetchWithRetry } from '../download-assets';

describe('fetchWithRetry', () => {
  let originalFetch;
  let sandbox;

  beforeEach(() => {
    originalFetch = global.fetch;
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    sandbox.restore();
  });

  it('should return the response on a successful fetch', async () => {
    const mockResponse = { ok: true, status: 200 };
    global.fetch = sandbox.stub().resolves(mockResponse);

    const result = await fetchWithRetry('https://example.com/file.js');

    expect(result).to.equal(mockResponse);
    expect(global.fetch.calledOnce).to.be.true;
  });

  it('should retry on failure and succeed on a subsequent attempt', async () => {
    const mockResponse = { ok: true, status: 200 };
    global.fetch = sandbox
      .stub()
      .onFirstCall()
      .rejects(new Error('socket closed'))
      .onSecondCall()
      .resolves(mockResponse);

    const result = await fetchWithRetry(
      'https://example.com/file.js',
      3,
      10, // short delay for tests
    );

    expect(result).to.equal(mockResponse);
    expect(global.fetch.calledTwice).to.be.true;
  });

  it('should throw after all retries are exhausted', async () => {
    const error = new Error('socket closed');
    global.fetch = sandbox.stub().rejects(error);

    try {
      await fetchWithRetry('https://example.com/file.js', 2, 10);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).to.equal(error);
    }

    expect(global.fetch.calledTwice).to.be.true;
  });

  it('should retry the correct number of times', async () => {
    global.fetch = sandbox.stub().rejects(new Error('network error'));

    try {
      await fetchWithRetry('https://example.com/file.js', 3, 10);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err.message).to.equal('network error');
    }

    expect(global.fetch.calledThrice).to.be.true;
  });
});
