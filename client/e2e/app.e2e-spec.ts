import { AppTestPage } from './app.po';

describe('app-test App', () => {
  let page: AppTestPage;

  beforeEach(() => {
    page = new AppTestPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
