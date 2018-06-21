
const { promisify } = require("util");
const fs = require("fs");
const prompt = require("prompt");
const { resolve } = require("path");

const get = promisify(prompt.get);
const readFile = promisify(fs.readFile);


var firebase = require('firebase/app');

var auth = require("firebase/auth");
var firestore2 = require("firebase/firestore");


// TODO import this from .env.local

const configMapping = {
    REACT_APP_FIREBASE_API_KEY: 'apiKey',
    REACT_APP_FIREBASE_AUTH_DOMAIN: 'authDomain',
    REACT_APP_FIREBASE_DATABASE_URL: 'databaseURL',
    REACT_APP_FIREBASE_PROJECT_ID: 'projectId' ,
    REACT_APP_FIREBASE_STORAGE_BUCKET: 'storageBucket' ,
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID: 'messagingSenderId',
};

const config = {};


function readConfig() {
  const file = resolve(process.cwd(), `.env.local`);
    return readFile(file, 'utf8');
}


const handleError = (error, errorInfo) => {
  console.error(error);
  console.error(errorInfo);
};

const handleSuccess = (data) => {
  console.error(data);
};


const initFirebase = () => {
    if (!firebase.apps.length) {
        firebase.initializeApp(config);
    }

    firestore = firebase.firestore();
    firestore.settings({ timestampsInSnapshots: true });
};

var organization_id = null;

var profile_id = null;

var email = "bwaite+55551@tripadvisor.com";

var password = "password3";


const setupAuth = () => {
 return firebase
    .auth()
    .signInWithEmailAndPassword(email, password);
};

const addOrganization = ({ name }) => {
  return firestore.collection("organizations").add({
    name: name,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
};

const addBox = (product_id) => {
    const values = { quantity: 8, comment: "test comment"};

    values.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    values.createdBy = firestore.doc("profiles/" + profile_id);
    values.organization = firestore.doc("organizations/" + organization_id); // firestore.doc(profile.data.organization.ref);
    //humanID: 500913

    values.product = firestore.doc( product_id);
    
    return firestore
        .collection("boxes")
        .add(values);
};

    
// TODO
const setProfile = (uid , data) => {
  // console.log("UID is: " + uid);
  // console.log("DATA is: " + data);

    
  return firestore
    .collection("profiles")
    .doc(uid)
    .set(data);
};

const createUserAndProfile = ({ email, password }, profile) => {
  return firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
        .then(({ user }) => setProfile(user.uid, profile));
};

const addProduct = (values, uid) => {

    console.log("organizations/" + organization_id);
    console.log("profiles/" + uid);
    
    values.organization = firestore.doc("organizations/" + organization_id); // firestore.doc(profile.data.organization.ref);

    values.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    values.createdBy = firestore.doc("profiles/" + uid); // firestore.doc(profile.data.ref);
    values.isDeleted = false;
    
    return  firestore
        .collection("products")
        .add(values);
};



// addOrganization({name: 'bryan test'})
//     .then( (ref) => {
//         var res = ref.id;
//         organization_res = res;
//         console.log(res);
//     })
//     .then( () => { return setupAuth(); })
//     .then( () => { addProduct( { category: "Woman", name: "test15", }) })
//     .then(() => { process.exit(); });

// setupAuth()
//     .then( () => { addOrganization({name: 'bryan test'}); })
//     .then( (organizations) => {
//         var res = Promise.resolve(organizations.docs[0].ref);
//         organization_res = res;
//     } )
//     .then(() => { process.exit(); });


// Add organization and profile
console.info("trying to create a test org");


prompt.start();
 
  //
  // Get two properties from the user: username and email
//

const schema = {
    properties: {
      email: {
        required: true
      },
      password: {
        hidden: true
      }
    }
  };

readConfig()
    .then( (result) => {
        for(let line of result.split('\n')) {
            const [key, val] = line.split('=');
            const firebaseKey = configMapping[key];
            if(firebaseKey != null) {
                config[firebaseKey] = val;
            }
        }
        console.log(config);
        initFirebase();
    })
    .catch( (r1) => { console.log(r1); process.exit(); } )
    .then( () => { return get(schema); })
    .then( (result) => {
        email = result.email;
        password = result.password;
        
        return addOrganization({name: 'bryan test 3'});
    })
     .then( (ref) => {
         organization_id = ref.id;
         const orgRef = {organization: firestore.doc('organizations/' + ref.id)};
         return createUserAndProfile({ email: email, password: password }, orgRef);
     })
    .then( () => {
        return setupAuth();
    })
    .catch( (r1) => { console.log(r1); process.exit(); } )
    .then( ({ user }) => {
        profile_id = user.uid;
        
        return addProduct({
            category: "Woman",
            name: "test15",
        }, user.uid);
    })
    .catch( (r1) => { console.log(r1); process.exit(); } )
    .then( (res) => {
        let product_id = res._key.path.segments.join('/');
        return addBox(product_id);
        
    } )
    .then( () => {  process.exit(); });
