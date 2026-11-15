export function initApp(root: HTMLElement = document.body): void {
  const app = document.createElement('div');
  app.id = 'app';
  root.appendChild(app);
}
initApp();
