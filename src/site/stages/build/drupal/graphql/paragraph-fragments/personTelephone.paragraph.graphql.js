module.exports = `
  fieldTelephone {
    ... on FieldNodePersonProfileFieldTelephone {
      entity {
        ... phoneNumber
      }
    }
  }`;
