import React, { useState } from 'react';
import { Layout } from 'antd';

import './dashboard.css';

export const Dashboard: React.FC = () => {
  return (
    <Layout>
      <ul>
        {/* {submissions.map((submission, index) => (
          <li key={index}>{submission.title}</li>
        ))} */}
      </ul>
    </Layout>
  );
};
