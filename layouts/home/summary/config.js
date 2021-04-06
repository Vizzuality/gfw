import card1 from './images/card-0.png';
import card2 from './images/card-1.png';
import card3 from './images/card-2.png';
import card4 from './images/card-3.png';
import card5 from './images/card-4.png';

export default [
  {
    title: 'Discover the world’s forests through data',
    description:
      'Explore over 100 global and local data sets to learn about conservation, land use, forest communities, and much more.',
    button: {
      label: 'EXPLORE OUR DATA',
      href:
        '/map/?menu=eyJkYXRhc2V0Q2F0ZWdvcnkiOiJmb3Jlc3RDaGFuZ2UiLCJtZW51U2VjdGlvbiI6ImRhdGFzZXRzIn0%3D',
    },
    image: card1,
  },
  {
    title: 'Be the first to see new tropical deforestation',
    description:
      'View, analyze, and subscribe to get weekly GLAD deforestation alerts that show where tree cover loss is happening right now in the tropics.',
    button: {
      label: 'VIEW GLAD ALERTS',
      href:
        '/map/?analysis=eyJzaG93QW5hbHlzaXMiOnRydWUsImhpZGRlbiI6ZmFsc2V9&map=eyJ6b29tIjozLCJjZW50ZXIiOnsibGF0IjotNC4yMTQ5NDMxNDEzOTA2MzksImxuZyI6LTUuODAwNzgxMjUwMDAwMDAxfSwiY2FuQm91bmQiOmZhbHNlLCJiYm94IjpudWxsLCJkYXRhc2V0cyI6W3siZGF0YXNldCI6ImU2NjNlYjA5LTA0ZGUtNGYzOS1iODcxLTM1YzZjMmVkMTBiNSIsIm9wYWNpdHkiOjEsInZpc2liaWxpdHkiOnRydWUsImxheWVycyI6WyJkZDVkZjg3Zi0zOWMyLTRhZWItYTQ2Mi0zZWY5NjliMjBiNjYiXX0seyJkYXRhc2V0IjoiZmRjOGRjMWItMjcyOC00YTc5LWIyM2YtYjA5NDg1MDUyYjhkIiwibGF5ZXJzIjpbIjZmNjc5OGU2LTM5ZWMtNDE2My05NzllLTE4MmE3NGNhNjVlZSIsImM1ZDFlMDEwLTM4M2EtNDcxMy05YWFhLTQ0ZjcyOGMwNTcxYyJdLCJvcGFjaXR5IjoxLCJ2aXNpYmlsaXR5Ijp0cnVlfV19&menu=eyJtZW51U2VjdGlvbiI6IiIsImRhdGFzZXRDYXRlZ29yeSI6IiJ9',
    },
    image: card2,
  },
  {
    title: 'Quick global and country stats',
    description:
      'Analyze forest change and investigate trends anywhere in the world with just a few clicks.',
    button: {
      label: 'EXPLORE THE DASHBOARDS',
      href: '/dashboards/global/',
    },
    image: card3,
  },
  {
    title: 'Forest insights',
    description:
      'Read the latest stories and findings about forests from our team of researchers on the GFW blog.',
    button: {
      label: 'START LEARNING',
      href: 'https://blog.globalforestwatch.org/',
    },
    image: card4,
  },
  {
    title: 'A suite of tools',
    description:
      'Find out about the connections between deforestation and climate change, fires and haze, water security, and commodity supply chains with our specialized web applications.',
    button: {
      label: 'BROWSE OUR APPS',
      href: '/help/developers/',
    },
    image: card5,
  },
];
