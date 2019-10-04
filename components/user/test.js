const request = require('supertest');
const app = require('../../app');
const User = require('../user/model');

let user;

beforeEach(async () => {
  await User.deleteMany();
  user = new User({
    email: 'first@user.com',
    password: 'password1',
    handle: 'user1',
  });
  user.token = user.generateAuthToken();
  await user.save();
});

describe('POST /api/users', () => {
  it('Should sign up a new User, when email/password/handle are valid', async () => {
    const newUser = {
      email: 'ab@c.d',
      password: 'hello$password',
      handle: 'goodOne',
    };

    await request(app)
        .post('/api/users')
        .send(newUser)

        .expect(201);
  });
  it('Should fail to sign up a new User, when the email is invalid', async () => {
    const invalidUser = {
      email: 'badEmail',
      password: 'hello_password',
      handle: 'goodOne',
    };

    await request(app)
        .post('/api/users')
        .send(invalidUser)

        .expect(400);
  });
  it('Should fail to sign up a new User, when the password is too short', async () => {
    const invalidUser = {
      email: 'a.b@c.d',
      password: 'short',
      handle: 'user2',
    };

    await request(app)
        .post('/api/users')
        .send(invalidUser)

        .expect(400);
  });
  it('Should fail to sign up a new User, when handle is already used', async () => {
    const invalidUser = {
      email: 'a.b@c.d',
      password: 'goodenough',
      handle: 'user1',
    };

    await request(app)
        .post('/api/users')
        .send(invalidUser)

        .expect(400);
  });
});

describe('GET /api/users/login', () => {
  it('Should login user, when a valid email is passed as credential', async ()=> {
    const signInData = {
      credential: 'first@user.com',
      password: 'password1',
    };

    await request(app)
        .get('/api/users/login')
        .send(signInData)

        .expect(200);
  });
  it('Should login user, when a valid handle is passed as credential', async ()=> {
    const signInData = {
      credential: 'user1',
      password: 'password1',
    };

    await request(app)
        .get('/api/users/login')
        .send(signInData)

        .expect(200);
  });
  it('Should fail to login user, when wrong email/handle is passed', async ()=> {
    const signInData = {
      credential: 'fakeHandle',
      password: 'password1',
    };

    await request(app)
        .get('/api/users/login')
        .send(signInData)

        .expect(400);
  });
  it('Should fail to login user, when the password is wrong', async ()=> {
    const signInData = {
      credential: 'user1',
      password: 'password2',
    };

    await request(app)
        .get('/api/users/login')
        .send(signInData)

        .expect(400);
  });
});

describe('GET /api/users/me', () => {
  it('Should get Profile data, when the authorization token is valid', async () => {
    const authToken = 'Bearer '.concat(user.token);

    await request(app)
        .get('/api/users/me')
        .set('Authorization', authToken)

        .expect(200);
  });
  it('Should get profile data with no password inside it', async () => {
    const authToken = 'Bearer '.concat(user.token);

    await request(app)
        .get('/api/users/me')
        .set('Authorization', authToken)

        .expect(function(res) {
          if (JSON.parse(res.text).password != null) {
            throw new Error('Password must not be returned');
          }
        })
        .expect(200);
  });
  it('Should fail to get Profile data, when no token is passed', async () => {
    await request(app)
        .get('/api/users/me')

        .expect(400);
  });
  it('Should fail to get Profile data, when a wrong token is passed', async () => {
    const wrongToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'+
    'eyJfaWQiOiI1ZDk1NzIwOWM0YWY0ZjMzMWRkYTA4YmEiLCJpYXQiOjE1NzAwNzUxNDV9.'+
    'W1kYfvnUBkVvkUbrxtxtW_0rVOpl2RgAr8YOsQbZdsk';

    await request(app)
        .get('/api/users/me')
        .set('Authorization', wrongToken)

        .expect(404);
  });
  it('Should fail to get Profile data, when an Invalid token is passed', async () => {
    await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalidToken')

        .expect(401);
  });
});

describe('GET /api/users/userIdOrHandle', () => {
  it('Should get Public Profile data, when using his handle', async () => {
    await request(app)
        .get('/api/users/'.concat(user.handle))
        
        .expect(function(res) {
          if (JSON.parse(res.text).email != null) {
            throw new Error('Email is not public');
          }
          if (JSON.parse(res.text).password != null) {
            throw new Error('Password is not public');
          }
          if (JSON.parse(res.text).handle == null) {
            throw new Error('Handle is public');
          }
        })
        .expect(200);
  });
  it('Should get Public Profile data, when using his id', async () => {
    await request(app)
        .get('/api/users/'.concat(user._id))

        .expect(function(res) {
          if (JSON.parse(res.text).email != null) {
            throw new Error('Email is not public');
          }
          if (JSON.parse(res.text).password != null) {
            throw new Error('Password is not public');
          }
          if (JSON.parse(res.text).handle == null) {
            throw new Error('Handle is public');
          }
        })
        .expect(200);
  });
  it('Should get a 404 - no such user, when invalid handle is given', async () => {
    await request(app)
        .get('/api/users/'.concat('NoHandleMatchesThisOne'))

        .expect(404);
  });
});

describe('PUT /api/users/me', () => {
  it('Should Update user data', async () => {
    const authToken = 'Bearer '.concat(user.token);
    const newUserData = {
      password: '12345678',
      email: 'a@b.com',
    };

    await request(app)
        .put('/api/users/me')
        .set('Authorization', authToken)
        .send(newUserData)

        .expect(function(res) {
          if (JSON.parse(res.text).email != 'a@b.com') {
            throw new Error('Email was not updated!');
          }
        })
        .expect(200);
  });
  it('Should fail to update user data, when handle is being updated', async () => {
    const authToken = 'Bearer '.concat(user.token);
    const newUserData = {
      password: '12345678',
      email: 'a@b.com',
      handle: 'newOne',
    };

    await request(app)
        .put('/api/users/me')
        .set('Authorization', authToken)
        .send(newUserData)

        .expect(403);
  });
});

describe('DELETE /api/users/me', () => {
  it('Should delete the User', async () => {
    const authToken = 'Bearer '.concat(user.token);

    await request(app).delete('/api/users/me')
        .set('Authorization', authToken)

        .expect(204);
    await request(app).get('/api/users/me')
        .set('Authorization', authToken)

        .expect(404);
  });
});
