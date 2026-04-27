/* eslint-disable @department-of-veterans-affairs/axe-check-required */
import { expect } from 'chai';
import { downloadWithRetry } from '../download-assets';

describe('downloadWithRetry', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should return the response and buffer on a successful fetch', async () => {
    const body = 'test content';
    let fetchCalls = 0;
    const mockResponse = {
      ok: true,
      status: 200,
      arrayBuffer: async () => new TextEncoder().encode(body).buffer,
    };
    global.fetch = async () => {
      fetchCalls += 1;
      return mockResponse;
    };

    const result = await downloadWithRetry('https://example.com/file.js');

    expect(result.response).to.equal(mockResponse);
    expect(result.buffer.toString()).to.equal(body);
    expect(fetchCalls).to.equal(1);
  });

  it('should retry on fetch failure and succeed on a subsequent attempt', async () => {
    const body = 'test content';
    let fetchCalls = 0;
    const mockResponse = {
      ok: true,
      status: 200,
      arrayBuffer: async () => new TextEncoder().encode(body).buffer,
    };
    global.fetch = async () => {
      fetchCalls += 1;
      if (fetchCalls === 1) {
        throw new Error('socket closed');
      }
      return mockResponse;
    };

    const result = await downloadWithRetry(
      'https://example.com/file.js',
      3,
      10, // short delay for tests
    );

    expect(result.response).to.equal(mockResponse);
    expect(result.buffer.toString()).to.equal(body);
    expect(fetchCalls).to.equal(2);
  });

  it('should retry on body read failure and succeed on a subsequent attempt', async () => {
    const body = 'test content';
    let fetchCalls = 0;
    const failResponse = {
      ok: true,
      status: 200,
      arrayBuffer: async () => {
        throw new Error('terminated');
      },
    };
    const successResponse = {
      ok: true,
      status: 200,
      arrayBuffer: async () => new TextEncoder().encode(body).buffer,
    };
    global.fetch = async () => {
      fetchCalls += 1;
      if (fetchCalls === 1) {
        return failResponse;
      }
      return successResponse;
    };

    const result = await downloadWithRetry(
      'https://example.com/file.js',
      3,
      10,
    );

    expect(result.response).to.equal(successResponse);
    expect(result.buffer.toString()).to.equal(body);
    expect(fetchCalls).to.equal(2);
  });

  it('should throw after all retries are exhausted', async () => {
    const error = new Error('socket closed');
    let fetchCalls = 0;
    global.fetch = async () => {
      fetchCalls += 1;
      throw error;
    };

    try {
      await downloadWithRetry('https://example.com/file.js', 2, 10);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).to.equal(error);
    }

    expect(fetchCalls).to.equal(2);
  });

  it('should retry the correct number of times', async () => {
    let fetchCalls = 0;
    global.fetch = async () => {
      fetchCalls += 1;
      throw new Error('network error');
    };

    try {
      await downloadWithRetry('https://example.com/file.js', 3, 10);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err.message).to.equal('network error');
    }

    expect(fetchCalls).to.equal(3);
  });

  it('should throw on non-ok HTTP response', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
    };
    global.fetch = async () => mockResponse;

    try {
      await downloadWithRetry('https://example.com/file.js', 1, 10);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err.message).to.include('404');
    }
  });
});
