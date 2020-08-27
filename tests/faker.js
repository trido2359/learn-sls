const { name, random, phone } = require('faker');

module.exports.generateFakeEmail = () => {
    const { firstName, lastName } = name;
    const fakeEmail = firstName() + lastName() +
        random.number(2000) + '@yopmail.com';
    return fakeEmail;
}

module.exports.generatePhoneNumber = () => {
    return phone.phoneNumberFormat().replace(/-/g, '');
}