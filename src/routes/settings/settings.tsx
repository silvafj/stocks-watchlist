import React, { useState } from 'react';
import { Button, Layout } from 'antd';

import { db } from '../../models/db';

import './settings.css';

export const Settings: React.FC = () => {
  async function deleteDB() {
    await db.delete();
    await db.open();
  }

  return (
    <Layout>
      <Button onClick={() => deleteDB()}>Delete database</Button>
    </Layout>
  );
};
