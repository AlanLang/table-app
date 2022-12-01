import { createSheet, PageResult } from '@engine/table';
import { envProvider } from '@engine/core';
import tableData from './data.json';
import { useEffect } from 'react';
envProvider.assign({
  reqPrefix: '/webroot/decision/view/fit/form',
  sessionID: '',
  servletURL: '/webroot/decision/view/form',
  version: '',
  fineServletURL: '/webroot/decision',
  initParameters: {
      name: 'Hello World',
  },
});

function App() {
  useEffect(() => {
    createSheet({
      container: '#wrapper',
      tableData: tableData as PageResult[][],
      reportSettingDetail: {
          paperSetting: {
              orientation: 0,
              paperWidth: 793,
              paperHeight: 1122,
              marginLeft: 72,
              marginRight: 72,
              marginTop: 25,
              marginBottom: 25,
          },
          background: {
              'background-color': 'rgb(255,255,255)',
          },
      },
      reportFitAttr: {
          fitFont: false,
          fitStateInPC: 3,
      },
    });
  },[])
  return null;
}

export default App;
