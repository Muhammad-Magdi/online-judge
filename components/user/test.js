const request = require('supertest');
const app = require('../../app');
const User = require('../user/model');

beforeEach(async () => {
  await User.deleteMany();
  const user = new User({
    email: 'first@user.com',
    password: 'password1',
    handle: 'user1',
  });
  await user.save();
});

describe('Create User', () => {
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

describe('Login User', ()=> {
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
