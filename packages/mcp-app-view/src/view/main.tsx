import {App} from '@modelcontextprotocol/ext-apps';
import {version} from '../../package.json';
import {startA2uiAppView} from './start-a2ui-app-view';

const container = document.getElementById('root');
if (container !== null) {
  void startA2uiAppView(new App({name: 'ai37-a2ui-mcp-app', version}), container);
}
