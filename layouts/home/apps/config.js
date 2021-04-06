import forestWatcherIcon from 'assets/icons/forest-watcher.svg';
import proIcon from 'assets/icons/gfw-pro.svg';

import forestWatcherImage from './images/forestwatcher@2x.jpg';
import proImage from './images/pro-bg@2x.png';

export default [
  {
    title: 'Forest Watcher',
    description:
      "Access GFW's forest monitoring and alert system offline and collect data from the field, all from your mobile device",
    background: forestWatcherImage,
    extLink: 'https://forestwatcher.globalforestwatch.org/',
    color: '#97be32',
    icon: forestWatcherIcon,
  },
  {
    title: 'GFW Pro',
    description:
      'Securely manage deforestation risk in commodity supply chains',
    background: proImage,
    extLink: 'https://pro.globalforestwatch.org',
    color: '#404042',
    icon: proIcon,
    className: 'pro',
  },
];
