const formatDate = dateString => {
  const removeLeadingZero = s => s.replace(/^0+/, '');
  const [year, month, day] = dateString.split('-');
  return `${removeLeadingZero(month)}/${removeLeadingZero(day)}/${year}`;
};

const stripPrefix = label => label.replace('Digital Form: ', '');

module.exports = { formatDate, stripPrefix };
