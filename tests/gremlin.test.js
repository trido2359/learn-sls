const { generateFakeEmail } = require('./faker');
const {
    addVertextUser,
    getUserByEmail,
    getListRoles,
    addVertextRole,
    getRoleByRole
} = require('./repository');
const { getConnect } = require('./connectDb')
const gremlin = require('gremlin');
const { label } = gremlin.process.t;
const { properties } = gremlin.process.statics;

describe('Test gremlin', () => {
    const { gNeptune, gTinkerPop } = getConnect();

    it('Add vertex users ', async () => {
        const newEmail = generateFakeEmail();
        const vUserNeptune = addVertextUser(gNeptune, newEmail);
        const vUserTinker = addVertextUser(gTinkerPop, newEmail);

        const result = await Promise.all([vUserNeptune, vUserTinker]);

        console.log('--result add--');
        console.log(result);
        
        const userNeptune = await getUserByEmail(gNeptune, newEmail);
        const userTinker = await getUserByEmail(gTinkerPop, newEmail);

        console.log('--result userNeptune--');
        console.log(userNeptune);
        console.log('--result userTinker--');
        console.log(userTinker);
        // save new vertex
        expect(result[0].value.id).not.toBeNull();
        expect(result[0].value.label).not.toBeNull();
        expect(result[0].value.properties).toBeUndefined();

        expect(result[1].value.id).not.toBeNull();
        expect(result[1].value.label).not.toBeNull();
        expect(result[1].value.properties).toBeUndefined();
        // find vertex by email
        expect(userNeptune.value).not.toBeNull();
        expect(userTinker.value).not.toBeNull();
    })

    it('Add vertex roles', async () => {
        const roles = ['super_admin', 'admin', 'teacher', 'student', 'MST', 'admin_MST', 'super_admin_MST'];
        const index = Math.floor(Math.random() * roles.length); // 0 -> length - 1
        const rolesNeptune = await getListRoles(gNeptune);
        const rolesTinker = await getListRoles(gTinkerPop);
        const role = roles[index];
        console.log(role);
        console.log(rolesNeptune);
        console.log(rolesTinker);
        console.log(!rolesNeptune.includes(role));
        console.log(!rolesTinker.includes(role));
        
        
        
        if (!rolesNeptune.includes(role)) {
            const result = await addVertextRole(gNeptune, role);
            expect(result.value.id).not.toBeNull();
            expect(result.value.label).not.toBeNull();
            expect(result.value.properties).toBeUndefined();
        }
        if (!rolesTinker.includes(role)) {
            const result = await addVertextRole(gTinkerPop, role);
            expect(result.value.id).not.toBeNull();
            expect(result.value.label).not.toBeNull();
            expect(result.value.properties).toBeUndefined();
        }

        const roleResult = await Promise.all([
            getRoleByRole(gNeptune, role),
            getRoleByRole(gTinkerPop, role)
        ])


        // find vertex by email
        expect(roleResult[0].value).not.toBeNull();
        expect(roleResult[1].value).not.toBeNull();
    })

    // it('Add associated vertex(users) path userHasAccountType', async () => {
    //     const newEmail = generateFakeEmail();
    //     const nameEdge = 'userHasAccountType';
    //     // add vertex
    //     await g.addV('users')
    //         .property('DateOfBirth', '1997-01-02')
    //         .property('Email', newEmail)
    //         .property('CountryofResidence', 'Vietnam')
    //         .property('ContactNumber', generatePhoneNumber())
    //         .property('UserFirstName', 'Tri')
    //         .property('LastName', 'Do')
    //         .property('Gender', 'Male')
    //         .property('ProfilePicture', true)
    //         .property('ActiveStatus', 'Approved').next();

    //     // associated vertex with vertex
    //     const roleStudent = g.V().hasLabel('accounTypes').hasId('P');
    //     const result = await g.V().hasLabel('users').has('Email', newEmail)
    //         .addE(nameEdge)
    //         .property('createdDate', '2019-09-09T00:00:00.000Z')
    //         .property('effectiveDate', '2019-09-09T00:00:00.000Z')
    //         .to(roleStudent).next();

    //     // check result
    //     const user = await g.V().hasLabel('users').has('Email', newEmail).next()
    //     const edgeOfUser = await g.V().hasLabel('users').has('Email', newEmail)
    //     .outE().as('ed').inV().select('ed').by(label).next()
    //     console.log(user);
    //     console.log('nameEdge');
    //     console.log(edgeOfUser);
        
    //     expect(user.value).not.toBeNull();
    //     expect(edgeOfUser.value).toEqual(nameEdge);
    // })

});