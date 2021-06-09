/* eslint-disable no-param-reassign */
/* eslint-disable no-console */

require('isomorphic-fetch');
const fs = require('fs-extra');
const path = require('path');
const buckets = require('../../../constants/buckets');

// exits with non-zero if a download failed (for jenkins)
process.on('unhandledRejection', up => {
  throw up;
});

async function downloadFromLiveBucket(files, buildOptions) {
  const bucket = buckets[buildOptions.buildtype];
  const fileManifestPath = 'generated/file-manifest.json';

  const fileManifestRequest = await fetch(`${bucket}/${fileManifestPath}`);
  const fileManifest = await fileManifestRequest.json();

  files[fileManifestPath] = {
    path: fileManifestPath,
    // We don't need to store file manifest in 'file' object
    contents: '',
  };

  const buildPath = path.join('build', buildOptions.buildtype);

  // Store file manifest directly on disk
  fs.outputFileSync(
    path.join(buildPath, fileManifestPath),
    Buffer.from(JSON.stringify(fileManifest)),
  );

  const entryNames = Object.keys(fileManifest);

  const downloads = entryNames.map(async entryName => {
    let bundleFileName = fileManifest[entryName];
    const bundleUrl = bundleFileName.includes(bucket)
      ? `${bundleFileName}`
      : `${bucket}${bundleFileName}`;
    const bundleResponse = await fetch(bundleUrl);

    if (bundleFileName.includes('generated/../')) {
      console.log(`Excluding: ${bundleFileName} from download`);
    } else {
      if (!bundleResponse.ok) {
        throw new Error(`Failed to download asset: ${bundleUrl}`);
      }

      if (bundleFileName.startsWith('/')) {
        bundleFileName = bundleFileName.slice(1);
      }

      files[bundleFileName] = {
        path: bundleFileName,
        // No need to store file contents here since
        // assets will be stored directly on disk
        contents: '',
      };

      // Store file contents directly on disk
      fs.outputFileSync(
        path.join(buildPath, bundleFileName),
        await bundleResponse.buffer(),
      );

      console.log(`Successfully downloaded asset: ${bundleUrl}`);
    }
  });

  return Promise.all(downloads);
}

function downloadAssets(buildOptions) {
  return async (files, smith, done) => {
    // If this is not a localhost build OR --nosymlink is set, download assets
    if (buildOptions.buildtype !== 'localhost' || buildOptions.nosymlink) {
      await downloadFromLiveBucket(files, buildOptions);
    }

    done();
  };
}

module.exports = downloadAssets;
