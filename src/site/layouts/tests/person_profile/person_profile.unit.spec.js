import { expect } from 'chai';
import { parseFixture, renderHTML } from '~/site/tests/support';

const layoutPath = 'src/site/layouts/person_profile.drupal.liquid';
const data = parseFixture(
  'src/site/layouts/tests/person_profile/fixtures/download-full-size-photo-link.json',
);

describe('person-profile', () => {
  describe('has fieldMedia', () => {
    it('displays person profile detail page thumbnail image', async () => {
      const container = await renderHTML(
        layoutPath,
        data.trueFieldPhotoAllowHiresDownloadAndHasImageUrl,
        'trueFieldPhotoAllowHiresDownloadAndHasImageUrl',
      );

      expect(
        container.querySelector('.person-profile-detail-page-image').src,
      ).to.equal(
        data.trueFieldPhotoAllowHiresDownloadAndHasImageUrl.fieldMedia.thumbnail
          .image.derivative.url,
      );
    });
  });

  describe('has no fieldMedia', () => {
    it('does not display person profile detail page thumbnail image', async () => {
      const container = await renderHTML(
        layoutPath,
        data.falseFieldPhotoAllowHiresDownloadAndNoFieldMedia,
        'falseFieldPhotoAllowHiresDownloadAndNoFieldMedia',
      );

      expect(container.querySelector('.person-profile-detail-page-image')).to
        .not.exist;
    });
  });

  describe('fieldPhotoAllowHiresDownload equals true and has image url', () => {
    it('displays download-full-size-photo-link', async () => {
      const container = await renderHTML(
        layoutPath,
        data.trueFieldPhotoAllowHiresDownloadAndHasImageUrl,
        'trueFieldPhotoAllowHiresDownloadAndHasImageUrl',
      );

      expect(
        container.querySelector('#download-full-size-photo-link a').href,
      ).to.equal(
        data.trueFieldPhotoAllowHiresDownloadAndHasImageUrl.fieldMedia.hiRes
          .image.derivative.url,
      );
    });
  });

  describe('fieldPhotoAllowHiresDownload equals true and has no fieldMedia', () => {
    it('does not display download-full-size-photo-link', async () => {
      const container = await renderHTML(
        layoutPath,
        data.trueFieldPhotoAllowHiresDownloadAndNoFieldMedia,
        'trueFieldPhotoAllowHiresDownloadAndNoFieldMedia',
      );

      expect(container.querySelector('#download-full-size-photo-link')).to.not
        .exist;
    });
  });

  describe('fieldPhotoAllowHiresDownload equals false and has image url', () => {
    it('does not display download-full-size-photo-link', async () => {
      const container = await renderHTML(
        layoutPath,
        data.falseFieldPhotoAllowHiresDownloadAndHasImageUrl,
        'falseFieldPhotoAllowHiresDownloadAndHasImageUrl',
      );

      expect(container.querySelector('#download-full-size-photo-link')).to.not
        .exist;
    });
  });

  describe('fieldPhotoAllowHiresDownload equals false and has no fieldMedia', () => {
    it('does not display download-full-size-photo-link', async () => {
      const container = await renderHTML(
        layoutPath,
        data.falseFieldPhotoAllowHiresDownloadAndNoFieldMedia,
        'falseFieldPhotoAllowHiresDownloadAndNoFieldMedia',
      );

      expect(container.querySelector('#download-full-size-photo-link')).to.not
        .exist;
    });
  });
});
