import './styles/main.css';
import { renderHome, renderVenue, renderMap, renderLog, renderLeaderboardDemo } from './js/pages.js';

const app = document.getElementById('app');

function shell(active) {
  return `
    <header class="site-header">
      <div class="site-header-inner">
        <a class="brand" href="#/">DMV <span>Escape Rooms</span></a>
        <nav class="nav">
          <a href="#/" class="${active === 'home' ? 'active' : ''}">Venues</a>
          <a href="#/map" class="${active === 'map' ? 'active' : ''}">Map</a>
          <a href="#/log" class="${active === 'log' ? 'active' : ''}">My log</a>
        </nav>
      </div>
    </header>
    <main id="content"></main>
    <footer class="site-footer">
      Open data from <code>docs/dmv-escape-rooms-v1.md</code> · MIT · No live inventory or leaderboards in V1
    </footer>
  `;
}

function parseRoute() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [pathPart] = raw.split('?');
  const path = pathPart.startsWith('/') ? pathPart : '/' + pathPart;
  return { path };
}

function route() {
  const { path } = parseRoute();
  let active = 'home';
  if (path.startsWith('/map')) active = 'map';
  else if (path.startsWith('/log')) active = 'log';
  else if (path.startsWith('/venue/')) active = 'home';

  app.innerHTML = shell(active);
  app.classList.toggle('map-mode', active === 'map');
  const content = document.getElementById('content');

  if (path === '/' || path === '' || path.startsWith('/?')) {
    renderHome(content);
  } else if (path.startsWith('/venue/')) {
    const id = decodeURIComponent(path.slice('/venue/'.length).split('/')[0]);
    renderVenue(content, id);
  } else if (path.startsWith('/map')) {
    renderMap(content);
  } else if (path.startsWith('/log')) {
    renderLog(content);
  } else if (path.startsWith('/leaderboard-demo')) {
    renderLeaderboardDemo(content);
  } else {
    content.innerHTML = '<p class="empty">Page not found. <a href="#/">Go home</a></p>';
  }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
if (!location.hash) location.hash = '#/';
else route();
