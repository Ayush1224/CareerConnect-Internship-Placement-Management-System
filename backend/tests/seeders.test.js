import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectDemoDatabase } from '../seeders/seedHelpers.js';

test('demo seed database selection requires an isolated, explicit database', () => {
  const originalDemoDb = process.env.DEMO_DB_NAME;
  const originalMongoDb = process.env.MONGO_DB_NAME;
  try {
    delete process.env.DEMO_DB_NAME;
    delete process.env.MONGO_DB_NAME;
    assert.throws(() => selectDemoDatabase(), /DEMO_DB_NAME must explicitly select/);

    for (const databaseName of ['careerconnect', 'careerconnect_auth_test', 'careerconnect_stage']) {
      process.env.DEMO_DB_NAME = databaseName;
      process.env.MONGO_DB_NAME = databaseName;
      assert.throws(() => selectDemoDatabase(), /valid database name containing "demo"|forbidden/);
    }

    process.env.DEMO_DB_NAME = 'careerconnect_portfolio_demo';
    process.env.MONGO_DB_NAME = 'careerconnect';
    assert.throws(() => selectDemoDatabase(), /must match DEMO_DB_NAME/);

    process.env.MONGO_DB_NAME = 'careerconnect_portfolio_demo';
    assert.equal(selectDemoDatabase(), 'careerconnect_portfolio_demo');
  } finally {
    if (originalDemoDb === undefined) delete process.env.DEMO_DB_NAME;
    else process.env.DEMO_DB_NAME = originalDemoDb;
    if (originalMongoDb === undefined) delete process.env.MONGO_DB_NAME;
    else process.env.MONGO_DB_NAME = originalMongoDb;
  }
});
