const { generateFakeEmail } = require('./faker');
const {
    addVertextUser,
    getUserByEmail,
    getUserById,
    getListRoles,
    addVertextRole,
    getRoleByRole,
    addUserToRole,
    getEdgeUserHasRole,
    getEdgeUserHasNoRole,
    deleteUserById
} = require('./repository');
const { getConnect } = require('./connectDb')
const gremlin = require('gremlin');
const { label } = gremlin.process.t;
const { properties } = gremlin.process.statics;

describe('Test gremlin', () => {
    const { gNeptune, gTinkerPop } = getConnect();

    describe('Add vertex into neptune & tinkerPop', () => {
        it('Add vertex users ', async () => {
            const newEmail = generateFakeEmail();
            const vUserNeptune = await addVertextUser(gNeptune, newEmail);
            const vUserTinker = await addVertextUser(gTinkerPop, newEmail);
            
            const userNeptune = await getUserByEmail(gNeptune, newEmail);
            const userTinker = await getUserByEmail(gTinkerPop, newEmail);
    
            // check number properties every object
            expect(Object.keys(vUserNeptune).length).toEqual(Object.keys(vUserTinker).length)
            expect(Object.keys(userNeptune).length).toEqual(Object.keys(userTinker).length)
            // check { key } exists in vUserNeptune, vUserTinker
            let index = 0;
            const keyVUserTinler = Object.keys(vUserTinker);
            for (const [key, value] of Object.entries(vUserNeptune)) {
                expect(key).toEqual(keyVUserTinler[index]) // check key
                index ++;
            }
            // check { value, done } of vUserNeptune, vUserTinker
            const keyVUserTinkerValue = Object.keys(vUserTinker.value);
            index = 0;
            for (const [key, value] of Object.entries(vUserNeptune.value)) {
                expect(key).toEqual(keyVUserTinkerValue[index]) // check key of value
                if (key === 'label') {
                    expect(value).toEqual(vUserTinker.value[key]) // check value of value
                }
                index ++;
            }
            // find vertex by email
            // check { key } exists in userNeptune, userTinker
            index = 0;
            const keyUserTinler = Object.keys(userTinker);
            for (const [key, value] of Object.entries(userNeptune)) {
                expect(key).toEqual(keyUserTinler[index]) // check key
                index++;
            }
            // check { value, done } of vUserNeptune, vUserTinker
            const keyUserTinkerValue = Object.keys(userTinker.value);
            index = 0;
            for (const [key, value] of Object.entries(userNeptune.value)) {
                expect(key).not.toBeNull();
                expect(keyUserTinkerValue[index]).not.toBeNull();
                index ++;
            }
        })
    
        it('Add vertex roles', async () => {
            const roles = ['super_admin', 'admin', 'teacher', 'student', 'MST', 'admin_MST', 'super_admin_MST'];
            const indexRole = Math.floor(Math.random() * roles.length); // 0 -> length - 1
            const rolesNeptune = await getListRoles(gNeptune);
            const rolesTinker = await getListRoles(gTinkerPop);
            const role = roles[indexRole];
            
            // check exists key of rolesNeptune
            if (!rolesNeptune.includes(role)) {
                const vRoleNeptune = await addVertextRole(gNeptune, role);
                for (const [key, value] of Object.entries(vRoleNeptune)) {
                    expect(key).not.toBeNull();
                    if (key === 'properties') {
                        expect(vRoleNeptune.value.properties).toBeUndefined();
                    }
                }      
            }
            if (!rolesTinker.includes(role)) {
                const vRoleTinker = await addVertextRole(gTinkerPop, role);
                for (const [key, value] of Object.entries(vRoleTinker)) {
                    expect(key).not.toBeNull();
                    if (key === 'properties') {
                        expect(vRoleTinker.value.properties).toBeUndefined();
                    }
                }  
            }
    
            const roleResult = await Promise.all([
                getRoleByRole(gNeptune, role),
                getRoleByRole(gTinkerPop, role)
            ])
            const [ roleNeptune, roleTinker ] = roleResult;            

             // check { key } exists in roleNeptune, roleTinker
             let index = 0;
             const keyRoleTinker = Object.keys(roleTinker);
             for (const [key, value] of Object.entries(roleNeptune)) {
                 expect(key).toEqual(keyRoleTinker[index]) // check key
                 index ++;
             }

            // check { value, done } of roleNeptune, roleTinker
            const keyRoleTinkerValue = Object.keys(roleTinker.value);
            index = 0;
            for (const [key, value] of Object.entries(roleNeptune.value)) {
                expect(key).toEqual(keyRoleTinkerValue[index]) // check key of value
                if (key === 'label') {
                    expect(value).toEqual(roleTinker.value[key]) // check value of value
                }
                index ++;
            }
        })

    })

    describe('Associate users -> roles use neptune & tinkerPop', () => {
        it('Associate users -> roles', async () => {
            const newEmail = generateFakeEmail();
            const vUserNeptune = await addVertextUser(gNeptune, newEmail);
            const vUserTinker = await addVertextUser(gTinkerPop, newEmail);

            const rolesNeptune = await getListRoles(gNeptune);
            const rolesTinker = await getListRoles(gTinkerPop);

            // get roles between rolesNeptune and rolesTinker
            const roles = rolesNeptune.length >= rolesTinker.length ?
                rolesTinker.filter(role => {
                    return rolesNeptune.includes(role);
                }) : rolesNeptune.filter(role => {
                    return rolesTinker.includes(role);
                })
            
            if (roles.length === 0) {
                return ;
            }
            const role = roles[0];

            const userRole = await Promise.all([
                addUserToRole(gNeptune, newEmail, role),
                addUserToRole(gTinkerPop, newEmail, role)
            ]) ;
            const [ userRoleNeptune, userRoleTinker ] = userRole;

            // check result after add userRole
 
            let index = 0;
            const keyUserRoleTinker = Object.keys(userRoleTinker);
            for (const [key, value] of Object.entries(userRoleNeptune)) {
                expect(key).toEqual(keyUserRoleTinker[index]) // check key
                index ++;
            }
            // check Edge of userRoleNeptune, userRoleTinker
            const edgeUserRoleNeptune = await getEdgeUserHasRole(gNeptune, newEmail, role);
            const edgeUserRoleTinker = await getEdgeUserHasRole(gTinkerPop, newEmail, role);
            
            expect(edgeUserRoleNeptune).not.toBeNull();
            expect(edgeUserRoleTinker).not.toBeNull();
            expect(edgeUserRoleNeptune.value).not.toBeNull();
            expect(edgeUserRoleTinker.value).not.toBeNull();
        })
    })

    describe('Update properties of users use neptune & tinkerPop', () => {
        
    })

    describe('Update properties of edge users -> roles use neptune & tinkerPop', () => {
        
    })

    describe('Delete users use gremlin', () => {

        it('Delete 1 vertex has no role users use neptune & tinkerPop', async () => {
            const userNeptune = await getEdgeUserHasNoRole(gNeptune); // return { id: '123', done: false }
            const userTinker = await getEdgeUserHasNoRole(gTinkerPop);
            console.log(userNeptune.value.get('id'));
            console.log(userTinker);
            
            
            const vDropNeptune = await deleteUserById(gNeptune, userNeptune.value.get('id')); // return  { value: Map { 'id' => 0 }, done: false }
            const vDropTinker = await deleteUserById(gTinkerPop, userTinker.value.get('id'));
            console.log(vDropNeptune);
            console.log(vDropTinker);
            
            

            const userNeptuneAfterDeteted = await getUserById(gNeptune, userNeptune.value.get('id')); // return { value: '123', done: true }
            const userTinkerAfterDeteted = await getUserById(gTinkerPop, userTinker.value.get('id'));

            expect(userNeptuneAfterDeteted.value).toBeNull();
            expect(userTinkerAfterDeteted.value).toBeNull();

            expect(vDropNeptune.value).toBeNull();
            expect(vDropNeptune.done).not.toBeNull();
            expect(vDropTinker.value).toBeNull();
            expect(vDropTinker.done).not.toBeNull();
        })

        it('Delete properties of users use neptune & tinkerPop', () => {
        
        })

        it('Delete properties of edge users -> roles use neptune & tinkerPop', () => {
        
        })

        it('Delete edge users -> roles use neptune & tinkerPop', () => {
        
        })
    })

    



});