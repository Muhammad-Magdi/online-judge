const request = require('supertest');
const app = require('../../app');
const User = require('../user/model');

let user;
const wrongToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'+
'eyJfaWQiOiI1ZDk1NzIwOWM0YWY0ZjMzMWRkYTA4YmEiLCJpYXQiOjE1NzAwNzUxNDV9.'+
'W1kYfvnUBkVvkUbrxtxtW_0rVOpl2RgAr8YOsQbZdsk';

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
  it('Should Sign Up a new User', async () => {
    await request(app).post('/api/users')
        .send({
          email: 'ab@c.d',
          password: 'hello$password',
          handle: 'goodOne',
        })
        .expect(201);
  });
  it('Should Fail - Invalid email', async () => {
    await request(app).post('/api/users')
        .send({
          email: 'badEmail',
          password: 'hello_password',
          handle: 'goodOne',
        })
        .expect(400);
  });
  it('Should Fail - Invalid password', async () => {
    await request(app).post('/api/users')
        .send({
          email: 'a.b@c.d',
          password: 'short',
          handle: 'user2',
        })
        .expect(400);
  });
  it('Should Fail - duplicate handle', async () => {
    await request(app).post('/api/users')
        .send({
          email: 'a.b@c.d',
          password: 'goodenough',
          handle: 'user1',
        })
        .expect(400);
  });
});

describe('GET /api/users/login', () => {
  it('Should Login user using email', async ()=> {
    await request(app).get('/api/users/login')
        .send({
          credential: 'first@user.com',
          password: 'password1',
        })
        .expect(200);
  });
  it('Should Login user using handle', async ()=> {
    await request(app).get('/api/users/login')
        .send({
          credential: 'user1',
          password: 'password1',
        })
        .expect(200);
  });
  it('Should fail to Login user - wrong email/handle', async ()=> {
    await request(app).get('/api/users/login')
        .send({
          credential: 'fakeHandle',
          password: 'password1',
        })
        .expect(400);
  });
  it('Should fail to Login user - wrong password', async ()=> {
    await request(app).get('/api/users/login')
        .send({
          credential: 'user1',
          password: 'password2',
        })
        .expect(400);
  });
});

describe('GET /api/users/me', () => {
  it('Should Get Profile Data', async () => {
    await request(app).get('/api/users/me')
        .set('Authorization', 'Bearer '.concat(user.token))
        .expect(200);
  });
  it('Should not return the password', async () => {
    await request(app).get('/api/users/me')
        .set('Authorization', 'Bearer '.concat(user.token))
        .expect(function(res) {
          if (JSON.parse(res.text).password != null) {
            throw new Error('Password must not be returned');
          }
        })
        .expect(200);
  });
  it('Should fail to get profile Data - No Token', async () => {
    console.log(user.token);
    await request(app).get('/api/users/me')
        .expect(400);
  });
  it('Should fail to get Profile Data - wrong Token', async () => {
    await request(app).get('/api/users/me')
        .set('Authorization', 'Bearer '.concat(wrongToken))
        .expect(404);
  });
  it('Should fail to get profile Data - Invalid Token', async () => {
    await request(app).get('/api/users/me')
        .set('Authorization', 'Bearer '.concat('invalidToken'))
        .expect(401);
  });
});

describe('GET /api/users/userIdOrHandle', () => {
  it('Should Get Public Profile Data using his handle', async () => {
    await request(app).get('/api/users/'.concat(user.handle))
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
  it('Should Get Public Profile Data using his id', async () => {
    await request(app).get('/api/users/'.concat(user._id))
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
  it('Should get a 404 - no such user', async () => {
    await request(app).get('/api/users/'.concat('NoHandleMatchesThisOne'))
        .expect(404);
  });
});

describe('PUT /api/users/me', () => {
  it('Should Update user data', async () => {
    await request(app).put('/api/users/me')
        .set('Authorization', 'Bearer '.concat(user.token))
        .send({
          password: '12345678',
          email: 'a@b.com',
        })
        .expect(function(res) {
          if (JSON.parse(res.text).email != 'a@b.com') {
            throw new Error('Email was not updated!');
          }
        })
        .expect(200);
  });
  it('Should fail to update handle', async () => {
    await request(app).put('/api/users/me')
        .set('Authorization', 'Bearer '.concat(user.token))
        .send({
          password: '12345678',
          email: 'a@b.com',
          handle: 'newOne',
        })
        .expect(403);
  });
});

describe('DELETE /api/users/me', () => {
  it('Should Delete the user', async () => {
    await request(app).delete('/api/users/me')
        .set('Authorization', 'Bearer '.concat(user.token))
        .expect(204);
    await request(app).get('/api/users/me')
        .set('Authorization', 'Bearer '.concat(user.token))
        .expect(404);
  });
});
