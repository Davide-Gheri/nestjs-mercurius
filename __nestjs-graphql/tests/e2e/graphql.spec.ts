import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { ApplicationModule } from '../graphql/app.module';

describe('GraphQL', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ApplicationModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it(`should return query result`, () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: {},
        query: `
        {
          getCats {
            id,
            color,
            weight
          }
        }`,
      })
      .expect(200, {
        data: {
          getCats: [
            {
              id: 1,
              color: 'black',
              weight: 5,
            },
          ],
        },
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
