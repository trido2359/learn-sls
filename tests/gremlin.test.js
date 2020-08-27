const { generateFakeEmail, generatePhoneNumber } = require('./helper');
const { getConnect } = require('./connectDb')
const gremlin = require('gremlin');
const { label } = gremlin.process.t;
const { properties } = gremlin.process.statics;

describe('Test gremlin', () => {
    const g = getConnect();

    it('Have vertex users', async () => {
        const vertices = await g.V().group().by(label).by(properties().label().dedup().fold()).toList();
        const userProperties = vertices[0].get('users');
        expect(userProperties).not.toBeUndefined();
    });

    it('Have not vertex teachers', async () => {
        const vertices = await g.V().group().by(label).by(properties().label().dedup().fold()).toList();
        const teacherProperties = vertices[0].get('teachers');
        expect(teacherProperties).toBeUndefined();
    });

    it('Add vertex into vetices (users) ', async () => {
        const newEmail = generateFakeEmail();
        await g.addV('users')
            .property('DateOfBirth', '1997-01-02')
            .property('Email', newEmail)
            .property('CountryofResidence', 'Vietnam')
            .property('ContactNumber', '0965528621')
            .property('UserFirstName', 'Tri')
            .property('LastName', 'Do')
            .property('Gender', 'Male')
            .property('ProfilePicture', true)
            .property('ActiveStatus', 'Approved').next();

        const user = await g.V().hasLabel('users').has('Email', newEmail).next()
        console.log(user);
        
        expect(user.value).not.toBeNull();
    })

    it('Add vertex(users) and edge(userHasAccountType)', async () => {
        const newEmail = generateFakeEmail();
        const nameEdge = 'userHasAccountType';
        // add vertex
        await g.addV('users')
            .property('DateOfBirth', '1997-01-02')
            .property('Email', newEmail)
            .property('CountryofResidence', 'Vietnam')
            .property('ContactNumber', generatePhoneNumber())
            .property('UserFirstName', 'Tri')
            .property('LastName', 'Do')
            .property('Gender', 'Male')
            .property('ProfilePicture', true)
            .property('ActiveStatus', 'Approved').next();

        // associated vertex with vertex
        const roleStudent = g.V().hasLabel('accounTypes').hasId('P');
        const result = await g.V().hasLabel('users').has('Email', newEmail)
            .addE(nameEdge)
            .property('createdDate', '2019-09-09T00:00:00.000Z')
            .property('effectiveDate', '2019-09-09T00:00:00.000Z')
            .to(roleStudent).next();

        // check result
        const user = await g.V().hasLabel('users').has('Email', newEmail).next()
        const edgeOfUser = await g.V().hasLabel('users').has('Email', newEmail)
        .outE().as('ed').inV().select('ed').by(label).next()
        console.log(user);
        console.log('nameEdge');
        console.log(edgeOfUser);
        
        expect(user.value).not.toBeNull();
        expect(edgeOfUser.value).toEqual(nameEdge);
    })

});