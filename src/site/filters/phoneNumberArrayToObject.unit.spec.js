import { expect } from 'chai';

const phoneNumberArrayToObject = require('./phoneNumberArrayToObject');

describe('phoneNumberArrayToObject', () => {
  it('returns empty object if data is null', () => {
    const badData = null;
    const expected = {};
    expect(phoneNumberArrayToObject(badData)).to.eql(expected);
  });

  it('returns empty object if data is empty', () => {
    const badData = [];
    const expected = {};
    expect(phoneNumberArrayToObject(badData)).to.eql(expected);
  });

  it('returns empty object if all fields are missing', () => {
    const badData = [{ entity: null }];
    const expected = {};
    expect(phoneNumberArrayToObject(badData)).to.eql(expected);
  });

  it('returns empty object if fieldPhoneNumberType is missing', () => {
    const badData = [
      {
        entity: {
          fieldPhoneNumber: '123-456-7890',
        },
      },
    ];
    const expected = {};
    expect(phoneNumberArrayToObject(badData)).to.eql(expected);
  });

  it('converts array to object correctly', () => {
    const phoneNumbers = [
      {
        entity: {
          fieldPhoneNumberType: 'phone',
          fieldPhoneNumber: '123-456-7890',
          fieldPhoneLabel: 'Residential Program',
        },
      },
      {
        entity: {
          fieldPhoneNumberType: 'phone',
          fieldPhoneNumber: '123-456-0001',
          fieldPhoneLabel: 'Outpatient Program',
          fieldPhoneExtension: '999',
        },
      },
      {
        entity: {
          fieldPhoneNumberType: 'fax',
          fieldPhoneNumber: '123-456-0002',
        },
      },
      {
        entity: {
          fieldPhoneNumberType: 'fax',
          fieldPhoneNumber: '123-456-0003',
        },
      },
      {
        entity: {
          fieldPhoneNumberType: 'sms',
          fieldPhoneNumber: '123-456-0004',
        },
      },
    ];

    const expected = {
      phone: [
        {
          fieldPhoneNumber: '123-456-7890',
          fieldPhoneLabel: 'Residential Program',
        },
        {
          fieldPhoneNumber: '123-456-0001',
          fieldPhoneLabel: 'Outpatient Program',
          fieldPhoneExtension: '999',
        },
      ],
      fax: [
        { fieldPhoneNumber: '123-456-0002' },
        { fieldPhoneNumber: '123-456-0003' },
      ],
      sms: [{ fieldPhoneNumber: '123-456-0004' }],
    };

    expect(phoneNumberArrayToObject(phoneNumbers)).to.eql(expected);
  });
});
