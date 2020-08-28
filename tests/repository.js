const { generatePhoneNumber } = require('./faker');

module.exports.addVertextUser = (g, email) => {
    return g.addV('users')
    .property('DateOfBirth', '1997-01-02')
    .property('Email', email)
    .property('CountryofResidence', 'Vietnam')
    .property('ContactNumber', generatePhoneNumber())
    .property('UserFirstName', 'Tri')
    .property('LastName', 'Do')
    .property('Gender', 'Male')
    .property('ProfilePicture', true)
    .property('ActiveStatus', 'Approved').next();
}

module.exports.getUserByEmail = (g, email) => {
    return g.V().hasLabel('users').has('Email', email).next();
}


module.exports.getListRoles = (g) => {
    return g.V().hasLabel('roles').values('Role').toList();
}

module.exports.addVertextRole = (g, role) => {
    return g.addV('roles')
    .property('CreatedAt', '1997-01-02')
    .property('Role', role).next();
}

module.exports.getRoleByRole = (g, role) => {
    return g.V().hasLabel('roles').has('Role', role).next();
}

module.exports.addUserToRole = (g, email, role) => {
    const rolePromise = g.V().hasLabel('roles').has('Role', role);
    return g.V().hasLabel('users').has('Email', email)
        .addE('userHasRole')
        .property('createdDate', '2019-09-09T00:00:00.000Z')
        .property('effectiveDate', '2019-09-09T00:00:00.000Z')
        .to(rolePromise).next();
}