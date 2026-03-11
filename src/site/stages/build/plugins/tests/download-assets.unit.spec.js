/* eslint-disable @department-of-veterans-affairs/axe-check-required */
import { expect } from 'chai';
import sinon from 'sinon';
import { downloadWithRetry } from '../download-assets';

describe('downloadWithRetry', () => {
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

  it('should return the response and buffer on a successful fetch', async () => {
    const body = 'test content';
    const mockResponse = {
      ok: true,
      status: 200,
      arrayBuffer: sandbox
        .stub()
        .resolves(new TextEncoder().encode(body).buffer),
    };
    global.fetch = sandbox.stub().resolves(mockResponse);

    const result = await downloadWithRetry('https://example.com/file.js');

    expect(result.response).to.equal(mockResponse);
    expect(result.buffer.toString()).to.equal(body);
    expect(global.fetch.calledOnce).to.be.true;
  });

  it('should retry on fetch failure and succeed on a subsequent attempt', async () => {
    const body = 'test content';
    const mockResponse = {
      ok: true,
      status: 200,
      arrayBuffer: sandbox
        .stub()
        .resolves(new TextEncoder().encode(body).buffer),
    };
    global.fetch = sandbox
      .stub()
      .onFirstCall()
      .rejects(new Error('socket closed'))
      .onSecondCall()
      .resolves(mockResponse);

    const result = await downloadWithRetry(
      'https://example.com/file.js',
      3,
      10, // short delay for tests
    );

    expect(result.response).to.equal(mockResponse);
    expect(result.buffer.toString()).to.equal(body);
    expect(global.fetch.calledTwice).to.be.true;
  });

  it('should retry on body read failure and succeed on a subsequent attempt', async () => {
    const body = 'test content';
    const failResponse = {
      ok: true,
      status: 200,
      arrayBuffer: sandbox.stub().rejects(new Error('terminated')),
    };
    const successResponse = {
      ok: true,
      status: 200,
      arrayBuffer: sandbox
        .stub()
        .resolves(new TextEncoder().encode(body).buffer),
    };
    global.fetch = sandbox
      .stub()
      .onFirstCall()
      .resolves(failResponse)
      .onSecondCall()
      .resolves(successResponse);

    const result = await downloadWithRetry(
      'https://example.com/file.js',
      3,
      10,
    );

    expect(result.response).to.equal(successResponse);
    expect(result.buffer.toString()).to.equal(body);
    expect(global.fetch.calledTwice).to.be.true;
  });

  it('should throw after all retries are exhausted', async () => {
    const error = new Error('socket closed');
    global.fetch = sandbox.stub().rejects(error);

    try {
      await downloadWithRetry('https://example.com/file.js', 2, 10);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).to.equal(error);
    }

    expect(global.fetch.calledTwice).to.be.true;
  });

  it('should retry the correct number of times', async () => {
    global.fetch = sandbox.stub().rejects(new Error('network error'));

    try {
      await downloadWithRetry('https://example.com/file.js', 3, 10);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err.message).to.equal('network error');
    }

    expect(global.fetch.calledThrice).to.be.true;
  });

  it('should throw on non-ok HTTP response', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      arrayBuffer: sandbox.stub(),
    };
    global.fetch = sandbox.stub().resolves(mockResponse);

    try {
      await downloadWithRetry('https://example.com/file.js', 1, 10);
      expect.fail('should have thrown');
    } catch (err) {
      expect(err.message).to.include('404');
    }
  });
});
